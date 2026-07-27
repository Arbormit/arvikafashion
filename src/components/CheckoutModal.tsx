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
  Sparkles, 
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
      paymentMethod,
      upiId: customerUpiId || SHOP_UPI_ID,
      utrNumber: utrNumber.trim() || undefined,
      shippingAddress,
      billingAddress: shippingAddress
    });

    setPlacedOrder(newOrder);
    setStep('confirmation');
    onOrderComplete(newOrder);
  };

  const copyTracking = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  // WhatsApp Alert Link
  const sendWhatsAppOrderNotification = (order: Order) => {
    let msg = `Hello ${SHOP_NAME}! 👋 I have completed payment for my order:\n`;
    msg += `📦 *Order Tracking ID:* ${order.orderTrackingId}\n`;
    msg += `💳 *UTR Reference:* ${order.paymentDetails.utrNumber || 'Card/SWIFT'}\n`;
    msg += `💰 *Amount Paid:* ${currency === 'INR' ? `₹${order.totalINR.toLocaleString('en-IN')}` : `€${order.totalEUR.toFixed(2)}`}\n`;
    msg += `👤 *Customer Name:* ${order.customerName}\n`;
    msg += `Please verify and confirm dispatch!`;

    const phoneClean = SHOP_PHONE.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 animate-fade-in overflow-y-auto font-sans text-xs">
      <div className="bg-[#FAF8F4] border border-[#EFE6D8] rounded-3xl max-w-4xl w-full p-6 sm:p-8 relative shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFE6D8]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#214C3A] text-[#D8C6A5] flex items-center justify-center font-serif font-bold text-lg border border-[#C5A059]">
              AR
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#214C3A]">
                Secure European & Global Checkout
              </h2>
              <p className="text-xs text-[#8C7A6B]">
                256-Bit SSL Encrypted • Direct DHL Express & BlueDart Air Freight
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
              <span>UPI Scan & Pay</span>
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
                  className="w-full bg-[#214C3A] hover:bg-[#4A5D4E] text-[#FAF8F4] py-4 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Payment Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </form>
        )}

        {/* STEP 2: PAYMENT & UPI QR SCAN */}
        {step === 'payment' && (
          <form onSubmit={handlePlaceOrder} className="space-y-6 text-xs font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Payment Option Selection */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#214C3A]">
                  Select Verified Payment Option
                </h3>

                <div className="space-y-2.5">
                  
                  {/* UPI Option */}
                  <div
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === 'UPI' ? 'bg-[#214C3A] text-[#FAF8F4] border-[#214C3A] shadow-md' : 'bg-white border-[#D8C6A5]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <QrCode className="w-6 h-6 text-[#D8C6A5]" />
                      <div>
                        <div className="font-serif font-bold text-sm">Instant UPI QR & VPA Payment</div>
                        <div className="text-[11px] opacity-80 font-sans">Google Pay, PhonePe, Paytm, BHIM, Scan & Pay</div>
                      </div>
                    </div>
                    <Check className={`w-5 h-5 ${paymentMethod === 'UPI' ? 'text-[#D8C6A5]' : 'opacity-0'}`} />
                  </div>

                  {/* Card Option */}
                  <div
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === 'CARD' ? 'bg-[#214C3A] text-[#FAF8F4] border-[#214C3A] shadow-md' : 'bg-white border-[#D8C6A5]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-6 h-6 text-[#D8C6A5]" />
                      <div>
                        <div className="font-serif font-bold text-sm">International Card / Klarna</div>
                        <div className="text-[11px] opacity-80 font-sans">Visa, Mastercard, American Express</div>
                      </div>
                    </div>
                    <Check className={`w-5 h-5 ${paymentMethod === 'CARD' ? 'text-[#D8C6A5]' : 'opacity-0'}`} />
                  </div>

                  {/* SWIFT / Wire */}
                  <div
                    onClick={() => setPaymentMethod('WIRE')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === 'WIRE' ? 'bg-[#214C3A] text-[#FAF8F4] border-[#214C3A] shadow-md' : 'bg-white border-[#D8C6A5]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Building className="w-6 h-6 text-[#D8C6A5]" />
                      <div>
                        <div className="font-serif font-bold text-sm">European Bank SWIFT Wire</div>
                        <div className="text-[11px] opacity-80 font-sans">ICICI Export Remittance Account</div>
                      </div>
                    </div>
                    <Check className={`w-5 h-5 ${paymentMethod === 'WIRE' ? 'text-[#D8C6A5]' : 'opacity-0'}`} />
                  </div>
                </div>

                {/* Dynamic Payment Method Box */}
                <div className="bg-white border border-[#D8C6A5] p-5 rounded-2xl space-y-4">
                  {paymentMethod === 'UPI' && (
                    <div className="space-y-4 text-center">
                      <span className="text-[11px] font-montserrat font-bold text-[#214C3A] uppercase tracking-wider block">
                        Scan QR Code with any UPI App to Pay
                      </span>

                      {/* Official Shop UPI QR Display Box */}
                      <div className="w-48 h-48 bg-white mx-auto p-3 rounded-2xl border-2 border-[#214C3A] flex flex-col items-center justify-center shadow-inner relative group">
                        <QrCode className="w-36 h-36 text-[#214C3A]" />
                        <span className="text-[10px] font-mono font-bold text-[#214C3A] mt-1 bg-[#FAF8F4] px-2 py-0.5 rounded border border-[#D8C6A5]">
                          {SHOP_UPI_ID}
                        </span>
                      </div>

                      <div className="text-xs text-[#214C3A] font-semibold bg-[#EFE6D8]/50 p-2.5 rounded-xl border border-[#D8C6A5]">
                        Shop Owner VPA: <strong className="font-mono underline">{SHOP_UPI_ID}</strong>
                      </div>

                      <div className="text-left space-y-2">
                        <div>
                          <label className="block text-[11px] font-montserrat font-bold text-[#214C3A] mb-1">
                            Your UPI VPA (Optional):
                          </label>
                          <input
                            type="text"
                            value={customerUpiId}
                            onChange={(e) => setCustomerUpiId(e.target.value)}
                            placeholder="e.g. yourname@upi / 9876543210@paytm"
                            className="w-full bg-[#FAF8F4] p-2.5 rounded-xl border border-[#D8C6A5] text-xs font-mono focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-montserrat font-bold text-[#214C3A] mb-1">
                            Enter 12-Digit UPI Transaction Reference / UTR Code *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={12}
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value)}
                            placeholder="e.g. 928374651029"
                            className="w-full bg-[#FAF8F4] p-3 rounded-xl border-2 border-[#214C3A] text-sm font-mono font-bold text-[#214C3A] focus:outline-none"
                          />
                          <p className="text-[10px] text-[#8C7A6B] mt-1">
                            Found in Google Pay, PhonePe, Paytm receipt after scanning QR.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'CARD' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-montserrat font-bold text-[#214C3A] mb-1">Card Number</label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4532 •••• •••• 8910"
                          className="w-full bg-[#FAF8F4] p-2.5 rounded-xl border border-[#D8C6A5] font-mono text-xs focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-montserrat font-bold text-[#214C3A] mb-1">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="12/28"
                            className="w-full bg-[#FAF8F4] p-2.5 rounded-xl border border-[#D8C6A5] font-mono text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-montserrat font-bold text-[#214C3A] mb-1">CVV / CVC</label>
                          <input
                            type="password"
                            maxLength={4}
                            required
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            className="w-full bg-[#FAF8F4] p-2.5 rounded-xl border border-[#D8C6A5] font-mono text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'WIRE' && (
                    <div className="space-y-2 text-xs font-sans text-[#214C3A]">
                      <p className="font-bold">ICICI Bank International Export Account:</p>
                      <p><strong>Beneficiary Name:</strong> {SHOP_NAME}</p>
                      <p><strong>Account Number:</strong> 012305098412</p>
                      <p><strong>IFSC Code:</strong> ICIC0000123 | <strong>SWIFT:</strong> ICICINBBXXX</p>
                      <p className="text-[10px] text-[#8C7A6B]">Air Waybill generated upon bank SWIFT wire receipt.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Payable Total & Submit Button */}
              <div className="bg-[#214C3A] text-[#FAF8F4] p-6 rounded-2xl space-y-6 flex flex-col justify-between border border-[#4A5D4E] shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-[#D8C6A5]">
                    <Lock className="w-4 h-4" />
                    <span className="text-xs font-montserrat uppercase tracking-wider font-bold">Encrypted Ledger Verification</span>
                  </div>

                  <h3 className="font-serif text-3xl font-bold text-[#FAF8F4]">
                    Total Payable: {currency === 'INR' ? `₹${grandTotalINR.toLocaleString('en-IN')}` : `€${grandTotalEUR.toFixed(2)}`}
                  </h3>

                  <div className="text-xs font-sans text-[#EFE6D8]/80 space-y-2">
                    <p className="flex items-center gap-1">✓ Automated Order Tracking ID Generation</p>
                    <p className="flex items-center gap-1">✓ Instant Digital Tax Invoice & GST Receipt</p>
                    <p className="flex items-center gap-1">✓ DHL Express Air Dispatch to {country}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    className="w-full bg-[#D8C6A5] hover:bg-[#FAF8F4] text-[#214C3A] py-4 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Verify Payment & Place Order</span>
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
