import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  QrCode, 
  CreditCard, 
  Building, 
  Truck, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  FileText,
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  Globe,
  Copy,
  MessageSquare
} from 'lucide-react';
import { CartItem, Currency, Coupon, Order, User, Address } from '../types';
import { db, SHOP_UPI_ID, SHOP_NAME, SHOP_PHONE } from '../services/db';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currency: Currency;
  appliedCoupon: Coupon | null;
  user: User;
  onOrderComplete: (order: Order) => void;
  onViewInvoice: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  currency,
  appliedCoupon,
  user,
  onOrderComplete,
  onViewInvoice
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'address' | 'payment' | 'confirmation'>('address');

  // Address Selection
  const defaultAddr = user.addresses?.find((a) => a.isDefaultShipping) || user.addresses?.[0];
  const [selectedAddrId, setSelectedAddrId] = useState<string>(defaultAddr?.id || 'new');
  
  // Custom Address Fields
  const [fullName, setFullName] = useState(defaultAddr?.fullName || user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(defaultAddr?.phone || user.phone || '');
  const [street, setStreet] = useState(defaultAddr?.street || '');
  const [city, setCity] = useState(defaultAddr?.city || '');
  const [stateRegion, setStateRegion] = useState(defaultAddr?.state || '');
  const [postalCode, setPostalCode] = useState(defaultAddr?.zipCode || '');
  const [country, setCountry] = useState(defaultAddr?.country || 'India');

  // Sync address fields when selected address changes
  useEffect(() => {
    if (selectedAddrId !== 'new') {
      const match = user.addresses?.find((a) => a.id === selectedAddrId);
      if (match) {
        setFullName(match.fullName);
        setPhone(match.phone);
        setStreet(match.street);
        setCity(match.city);
        setStateRegion(match.state);
        setPostalCode(match.zipCode);
        setCountry(match.country);
      }
    }
  }, [selectedAddrId, user.addresses]);

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'WIRE'>('UPI');
  const [customerUpiId, setCustomerUpiId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Placed Order State
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Financial Calculations
  const subtotalINR = cart.reduce((sum, item) => sum + item.product.priceINR * item.quantity, 0);
  const subtotalEUR = cart.reduce((sum, item) => sum + item.product.priceEUR * item.quantity, 0);
  const subtotal = currency === 'INR' ? subtotalINR : subtotalEUR;

  let discountINR = 0;
  let discountEUR = 0;

  if (appliedCoupon) {
    if (appliedCoupon.discountPercentage) {
      discountINR = (subtotalINR * appliedCoupon.discountPercentage) / 100;
      discountEUR = (subtotalEUR * appliedCoupon.discountPercentage) / 100;
    } else if (appliedCoupon.discountFixedINR && appliedCoupon.discountFixedEUR) {
      discountINR = appliedCoupon.discountFixedINR;
      discountEUR = appliedCoupon.discountFixedEUR;
    }
  }

  const grandTotalINR = Math.max(0, subtotalINR - discountINR);
  const grandTotalEUR = Math.max(0, subtotalEUR - discountEUR);
  const grandTotal = currency === 'INR' ? grandTotalINR : grandTotalEUR;

  // Handle Place Order
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (paymentMethod === 'UPI' && !utrNumber.trim()) {
      setErrorMessage('Please enter the 12-Digit UTR/UPI Transaction Reference Number from your payment app.');
      return;
    }

    const shippingAddress: Address = {
      id: `addr_ord_${Date.now()}`,
      label: 'Order Delivery Address',
      fullName,
      phone,
      street,
      city,
      state: stateRegion,
      zipCode: postalCode,
      country
    };

    const newOrder = db.createOrder({
      userId: user.id || `usr_guest_${Date.now()}`,
      customerName: fullName,
      customerEmail: email,
      customerPhone: phone,
      items: cart,
      subtotalINR,
      subtotalEUR,
      discountINR,
      discountEUR,
      totalINR: grandTotalINR,
      totalEUR: grandTotalEUR,
      currency,
      paymentMethod: 'COD',
      shippingAddress,
      billingAddress: shippingAddress
    });

    setPlacedOrder(newOrder);
    setStep('confirmation');
    onOrderComplete(newOrder);
    sendWhatsAppOrderNotification(newOrder);
  };

  const copyTracking = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  // WhatsApp Alert Link
  const sendWhatsAppOrderNotification = (order: Order) => {
    let msg = `Hello ${SHOP_NAME}! 👋 I am contacting you to place my order:\n\n`;
    msg += `📦 *ORDER TRACKING ID:* ${order.orderTrackingId}\n`;
    msg += `👤 *Customer Name:* ${order.customerName}\n`;
    msg += `📞 *Phone:* ${order.customerPhone}\n`;
    msg += `📧 *Email:* ${order.customerEmail}\n`;
    msg += `📍 *Delivery Address:* ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}\n\n`;
    msg += `🛍️ *ORDER ITEMS:*\n`;
    order.items.forEach((item, idx) => {
      const itemPrice = currency === 'INR' ? `₹${(item.product.priceINR * item.quantity).toLocaleString('en-IN')}` : `€${(item.product.priceEUR * item.quantity).toFixed(2)}`;
      msg += `${idx + 1}. *${item.product.name}* (Shade: ${item.color}, Size: ${item.size}) x${item.quantity} - ${itemPrice}\n`;
    });
    msg += `\n💰 *Total Payable:* ${currency === 'INR' ? `₹${order.totalINR.toLocaleString('en-IN')}` : `€${order.totalEUR.toFixed(2)}`}\n\n`;
    msg += `Please guide me with the payment options to finalize my order!`;

    const phoneClean = SHOP_PHONE.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 animate-fade-in overflow-y-auto font-sans text-xs">
      <div className="bg-[#FAF8F4] border border-[#EFE6D8] rounded-3xl max-w-4xl w-full p-6 sm:p-8 relative shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFE6D8]">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="Arvika Fashion Logo"
              className="h-12 w-auto max-w-[180px] object-contain object-left"
            />
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#214C3A]">
                Direct WhatsApp Checkout & Consultation
              </h2>
              <p className="text-xs text-[#8C7A6B]">
                Direct Atelier Order Placement & Dedicated Customer Care
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-[#1C1C1C]/70 hover:text-[#214C3A] rounded-full hover:bg-[#EFE6D8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Step Progress Bar */}
        {step !== 'confirmation' && (
          <div className="py-4 flex items-center justify-center space-x-6 text-xs font-montserrat font-bold uppercase tracking-wider border-b border-[#EFE6D8] mb-6">
            <button
              onClick={() => setStep('address')}
              className={`flex items-center space-x-1.5 ${step === 'address' ? 'text-[#214C3A] underline' : 'text-[#8C7A6B]'}`}
            >
              <span className="w-5 h-5 rounded-full bg-[#214C3A] text-white flex items-center justify-center text-[10px]">1</span>
              <span>Shipping Address</span>
            </button>

            <span className="text-[#D8C6A5]">→</span>

            <button
              onClick={() => setStep('payment')}
              className={`flex items-center space-x-1.5 ${step === 'payment' ? 'text-[#214C3A] underline' : 'text-[#8C7A6B]'}`}
            >
              <span className="w-5 h-5 rounded-full bg-[#214C3A] text-white flex items-center justify-center text-[10px]">2</span>
              <span>WhatsApp Consultation & Order</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold mb-4 text-center">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: ADDRESS */}
        {step === 'address' && (
          <form onSubmit={() => setStep('payment')} className="space-y-6 text-xs font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Form Fields */}
              <div className="space-y-4">
                
                {/* Saved Address Selector */}
                {user.addresses && user.addresses.length > 0 && (
                  <div className="bg-white p-4 rounded-2xl border border-[#D8C6A5] space-y-2">
                    <label className="block font-montserrat font-bold text-[#214C3A]">
                      Select Saved Destination:
                    </label>
                    <select
                      value={selectedAddrId}
                      onChange={(e) => setSelectedAddrId(e.target.value)}
                      className="w-full bg-[#FAF8F4] p-2.5 rounded-xl border border-[#D8C6A5] text-xs font-semibold focus:outline-none"
                    >
                      {user.addresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label} ({a.city}, {a.country}) {a.isDefaultShipping ? '★ Default' : ''}
                        </option>
                      ))}
                      <option value="new">+ Enter Different Address</option>
                    </select>
                  </div>
                )}

                <h3 className="font-serif text-lg font-bold text-[#214C3A] flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#C5A059]" />
                  <span>Customer Contact Details</span>
                </h3>

                <div>
                  <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Astrid Sorensen"
                    className="w-full bg-white p-3 rounded-xl border border-[#D8C6A5] focus:outline-none focus:ring-1 focus:ring-[#214C3A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="astrid@domain.com"
                      className="w-full bg-white p-3 rounded-xl border border-[#D8C6A5] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+46 70 123 4567"
                      className="w-full bg-white p-3 rounded-xl border border-[#D8C6A5] focus:outline-none"
                    />
                  </div>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#214C3A] flex items-center gap-2 pt-2">
                  <MapPin className="w-4 h-4 text-[#C5A059]" />
                  <span>Delivery Destination</span>
                </h3>

                <div>
                  <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Street Address & Suite *</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Strandvägen 12, Apt 4B"
                    className="w-full bg-white p-3 rounded-xl border border-[#D8C6A5] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-montserrat font-bold text-[#214C3A] mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Stockholm"
                      className="w-full bg-white p-3 rounded-xl border border-[#D8C6A5] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-montserrat font-bold text-[#214C3A] mb-1">State/Region *</label>
                    <input
                      type="text"
                      required
                      value={stateRegion}
                      onChange={(e) => setStateRegion(e.target.value)}
                      placeholder="Stockholm Län"
                      className="w-full bg-white p-3 rounded-xl border border-[#D8C6A5] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Postal Code *</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="114 56"
                      className="w-full bg-white p-3 rounded-xl border border-[#D8C6A5] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Country *</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-white p-3 rounded-xl border border-[#D8C6A5] focus:outline-none"
                  >
                    <option value="India">India (BlueDart Express Air)</option>
                    <option value="Denmark">Denmark 🇩🇰 (DHL Express Worldwide)</option>
                    <option value="Sweden">Sweden 🇸🇪 (DHL Express Worldwide)</option>
                    <option value="Germany">Germany 🇩🇪 (DHL Express Worldwide)</option>
                    <option value="France">France 🇫🇷 (DHL Express Worldwide)</option>
                    <option value="United Kingdom">United Kingdom 🇬🇧 (DHL Express)</option>
                    <option value="United States">United States 🇺🇸 (FedEx Air Express)</option>
                  </select>
                </div>
              </div>

              {/* Right Column: Order Summary Brief */}
              <div className="bg-[#EFE6D8]/40 border border-[#D8C6A5] p-6 rounded-2xl space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#214C3A] mb-3">
                    Garment Basket Summary ({cart.length} Items)
                  </h3>

                  <div className="space-y-3 max-h-52 overflow-y-auto pr-1 divide-y divide-[#EFE6D8]">
                    {cart.map((item) => (
                      <div key={item.id} className="pt-2 first:pt-0 flex justify-between items-center text-xs">
                        <div className="flex items-center space-x-2">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-9 h-11 object-cover rounded-lg border border-[#EFE6D8]" />
                          <div>
                            <div className="font-serif font-bold text-[#214C3A] truncate max-w-[160px]">{item.product.name}</div>
                            <div className="text-[10px] text-[#8C7A6B]">Shade: {item.color} | Size: {item.size} | Qty: {item.quantity}</div>
                          </div>
                        </div>
                        <span className="font-serif font-bold text-[#214C3A]">
                          {currency === 'INR' ? `₹${(item.product.priceINR * item.quantity).toLocaleString('en-IN')}` : `€${(item.product.priceEUR * item.quantity).toFixed(2)}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#D8C6A5] pt-3 mt-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Garment Subtotal</span>
                      <span className="font-serif font-bold">{currency === 'INR' ? `₹${subtotalINR.toLocaleString('en-IN')}` : `€${subtotalEUR.toFixed(2)}`}</span>
                    </div>
                    {(discountINR > 0 || discountEUR > 0) && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Promotional Offer ({appliedCoupon?.code})</span>
                        <span>-{currency === 'INR' ? `₹${discountINR.toLocaleString('en-IN')}` : `€${discountEUR.toFixed(2)}`}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Global Express Air Freight</span>
                      <span className="text-emerald-700 font-bold">FREE</span>
                    </div>
                    <div className="flex justify-between text-base font-serif font-bold text-[#214C3A] pt-2 border-t border-[#D8C6A5]">
                      <span>Grand Total</span>
                      <span>{currency === 'INR' ? `₹${grandTotalINR.toLocaleString('en-IN')}` : `€${grandTotalEUR.toFixed(2)}`}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#214C3A] hover:bg-[#4A5D4E] text-[#FAF8F4] py-4 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Proceed to WhatsApp Order Summary</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </form>
        )}

        {/* STEP 2: WHATSAPP DIRECT ORDER & CONSULTATION */}
        {step === 'payment' && (
          <form onSubmit={handlePlaceOrder} className="space-y-6 text-xs font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* WhatsApp Direct Notice */}
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#214C3A]">
                  Direct WhatsApp Order & Consultation
                </h3>

                <div className="bg-white border-2 border-[#214C3A] p-6 rounded-3xl space-y-4 shadow-sm">
                  <div className="flex items-center space-x-3 text-[#214C3A]">
                    <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0">
                      <MessageSquare className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#214C3A]">
                        Personalized Atelier Order Handling
                      </h4>
                      <p className="text-xs text-[#8C7A6B]">
                        Payment & fulfillment are handled directly with our team on WhatsApp.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-[#214C3A] bg-[#FAF8F4] p-4 rounded-2xl border border-[#EFE6D8]">
                    <div className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                      <span><strong>Instant Order Record:</strong> Your unique tracking ID and tax invoice will be generated automatically.</span>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                      <span><strong>Personal Size Consultation:</strong> Our team will confirm measurements, custom colors, and fabric options with you directly.</span>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                      <span><strong>Convenient Self Payment:</strong> Payment details (Bank Transfer, UPI, or International Wire) will be provided directly during chat.</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Payable Total & Submit Button */}
              <div className="bg-[#214C3A] text-[#FAF8F4] p-6 rounded-2xl space-y-6 flex flex-col justify-between border border-[#4A5D4E] shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-[#D8C6A5]">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-montserrat uppercase tracking-wider font-bold">Direct Client Concierge</span>
                  </div>

                  <h3 className="font-serif text-3xl font-bold text-[#FAF8F4]">
                    Total Payable: {currency === 'INR' ? `₹${grandTotalINR.toLocaleString('en-IN')}` : `€${grandTotalEUR.toFixed(2)}`}
                  </h3>

                  <div className="text-xs font-sans text-[#EFE6D8]/80 space-y-2">
                    <p className="flex items-center gap-1">✓ Automated Order Tracking ID Generation</p>
                    <p className="flex items-center gap-1">✓ Instant Digital Tax Invoice & GST Receipt</p>
                    <p className="flex items-center gap-1">✓ Direct WhatsApp Order Confirmation to {country}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-4 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>Confirm & Connect on WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('address')}
                    className="w-full text-center text-xs text-[#D8C6A5] underline font-montserrat font-semibold"
                  >
                    ← Edit Shipping Address
                  </button>
                </div>
              </div>

            </div>
          </form>
        )}

        {/* STEP 3: ORDER CONFIRMATION & UNIQUE TRACKING ID */}
        {step === 'confirmation' && placedOrder && (
          <div className="py-6 space-y-6 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-[#214C3A] text-[#D8C6A5] flex items-center justify-center mx-auto shadow-xl border-2 border-[#C5A059]">
              <Check className="w-10 h-10 text-[#D8C6A5]" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-montserrat uppercase tracking-[0.25em] text-[#8C7A6B] font-bold">
                PAYMENT VERIFIED & ORDER CONFIRMED
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#214C3A]">
                Thank You, {placedOrder.customerName}!
              </h2>
              <p className="text-xs text-[#1C1C1C]/80 font-sans leading-relaxed">
                Your payment has been successfully linked. Order tracking ID and tax invoice have been saved to your account.
              </p>
            </div>

            {/* Tracking ID Hero Box */}
            <div className="bg-[#214C3A] text-[#FAF8F4] p-6 rounded-3xl max-w-xl mx-auto border-2 border-[#C5A059] shadow-xl space-y-3">
              <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#D8C6A5] font-bold">
                PERMANENT UNIQUE ORDER TRACKING ID
              </span>
              <div className="flex items-center justify-center space-x-3">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-[#D8C6A5]">
                  {placedOrder.orderTrackingId}
                </span>
                <button
                  onClick={() => copyTracking(placedOrder.orderTrackingId)}
                  className="bg-[#D8C6A5] text-[#214C3A] p-2 rounded-xl text-xs font-bold hover:bg-white transition-colors"
                >
                  {copiedTracking ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-[#EFE6D8]/80">
                Tracking Air Waybill: <strong>{placedOrder.trackingNumber}</strong> ({placedOrder.carrier})
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onViewInvoice(placedOrder)}
                className="bg-[#EFE6D8] hover:bg-[#D8C6A5] text-[#214C3A] px-6 py-3.5 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
              >
                <FileText className="w-4 h-4 text-[#C5A059]" />
                <span>View & Print Tax Invoice</span>
              </button>

              <button
                onClick={() => sendWhatsAppOrderNotification(placedOrder)}
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white px-6 py-3.5 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Send WhatsApp Order Confirmation</span>
              </button>

              <button
                onClick={onClose}
                className="bg-[#214C3A] text-[#FAF8F4] px-8 py-3.5 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider hover:bg-[#4A5D4E] transition-all"
              >
                Continue Shopping
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
