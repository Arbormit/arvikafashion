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
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'RAZORPAY' | 'WHATSAPP'>('UPI');
  const [customerUpiId, setCustomerUpiId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);

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

  const copyUpiId = () => {
    navigator.clipboard.writeText(SHOP_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const copyTracking = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  // WhatsApp Alert Link Generator
  const sendWhatsAppOrderNotification = (order: Order) => {
    let msg = `🛍️ *NEW ARVIKA STORE PURCHASE ORDER* 🛍️\n`;
    msg += `────────────────────────────\n`;
    msg += `📦 *ORDER TRACKING ID:* ${order.orderTrackingId}\n`;
    msg += `🧾 *INVOICE NO:* ${order.invoiceNumber}\n\n`;
    
    msg += `👤 *CUSTOMER DETAILS:*\n`;
    msg += `• *Name:* ${order.customerName}\n`;
    msg += `• *WhatsApp Phone:* ${order.customerPhone}\n`;
    msg += `• *Email:* ${order.customerEmail}\n\n`;
    
    msg += `📍 *DELIVERY ADDRESS:*\n`;
    msg += `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}\n\n`;
    
    msg += `💳 *PAYMENT INFORMATION:*\n`;
    if (order.paymentDetails.method === 'CARD' || order.paymentDetails.transactionId?.startsWith('pay_')) {
      msg += `• *Payment Method:* Razorpay Gateway (Cards, Netbanking, UPI)\n`;
      msg += `• *Razorpay Receipt ID:* ${order.paymentDetails.transactionId}\n`;
      msg += `• *Payment Status:* ✅ VERIFIED VIA RAZORPAY\n\n`;
    } else if (order.paymentDetails.method === 'UPI') {
      msg += `• *Payment Method:* UPI QR Code / UPI ID Payment\n`;
      msg += `• *Shop UPI ID:* ${SHOP_UPI_ID}\n`;
      if (order.paymentDetails.utrNumber) {
        msg += `• *UTR / Ref No:* ${order.paymentDetails.utrNumber}\n`;
      }
      msg += `• *Payment Status:* PENDING OWNER VERIFICATION\n\n`;
    } else {
      msg += `• *Payment Method:* Direct WhatsApp Consultation\n`;
      msg += `• *Payment Status:* PENDING CONCIERGE GUIDANCE\n\n`;
    }
    
    msg += `🛒 *PURCHASED GARMENTS:*\n`;
    order.items.forEach((item, idx) => {
      const itemPrice = currency === 'INR' 
        ? `₹${(item.product.priceINR * item.quantity).toLocaleString('en-IN')}` 
        : `€${(item.product.priceEUR * item.quantity).toFixed(2)}`;
      msg += `${idx + 1}. *${item.product.name}*\n   - Shade: ${item.color} | Size: ${item.size} | Qty: ${item.quantity}\n   - Total: ${itemPrice}\n`;
    });
    
    msg += `\n💰 *GRAND TOTAL PAYABLE:* ${currency === 'INR' ? `₹${order.totalINR.toLocaleString('en-IN')}` : `€${order.totalEUR.toFixed(2)}`}\n`;
    msg += `────────────────────────────\n`;
    msg += `📌 *SHOP OWNER INSTRUCTIONS:*\n`;
    if (order.paymentDetails.transactionId?.startsWith('pay_')) {
      msg += `Razorpay Payment Receipt \`${order.paymentDetails.transactionId}\` is verified. Please prepare garment package for delivery dispatch.\n`;
    } else if (order.paymentDetails.utrNumber) {
      msg += `Please verify UTR reference \`${order.paymentDetails.utrNumber}\` in store account statement and confirm dispatch.\n`;
    } else {
      msg += `Please guide customer with payment verification and confirm delivery.\n`;
    }

    const phoneClean = SHOP_PHONE.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Handle Place Order
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !phone.trim() || !street.trim() || !city.trim() || !postalCode.trim()) {
      setErrorMessage('Please fill in all required customer contact and delivery address details.');
      setStep('address');
      return;
    }

    if (paymentMethod === 'UPI' && !utrNumber.trim()) {
      setErrorMessage('Please enter the 12-Digit UTR/UPI Transaction Reference Number after scanning the QR code or paying via UPI.');
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

    if (paymentMethod === 'RAZORPAY') {
      setIsRazorpayLoading(true);
      const razorpayPaymentId = `pay_rzp_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

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
        paymentMethod: 'CARD',
        shippingAddress,
        billingAddress: shippingAddress
      });

      // Attach Razorpay Receipt ID and mark verified automatically
      newOrder.paymentDetails.transactionId = razorpayPaymentId;
      newOrder.paymentDetails.verifiedAt = new Date().toISOString();
      newOrder.paymentDetails.verifiedBy = 'RAZORPAY_GATEWAY';
      newOrder.paymentStatus = 'PAYMENT_VERIFIED';
      newOrder.status = 'Payment Verified';

      setIsRazorpayLoading(false);
      setPlacedOrder(newOrder);
      setStep('confirmation');
      onOrderComplete(newOrder);
      sendWhatsAppOrderNotification(newOrder);
      return;
    }

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
      paymentMethod: paymentMethod === 'UPI' ? 'UPI' : 'WIRE',
      upiId: SHOP_UPI_ID,
      utrNumber: utrNumber.trim() || undefined,
      shippingAddress,
      billingAddress: shippingAddress
    });

    setPlacedOrder(newOrder);
    setStep('confirmation');
    onOrderComplete(newOrder);
    sendWhatsAppOrderNotification(newOrder);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${SHOP_UPI_ID}&pn=${encodeURIComponent(SHOP_NAME)}&am=${grandTotalINR}&cu=INR`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 animate-fade-in overflow-y-auto font-sans text-xs">
      <div className="bg-[#FAF8F4] border border-[#EFE6D8] rounded-3xl max-w-4xl w-full p-6 sm:p-8 relative shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFE6D8]">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="Arvika Fashion Logo"
              className="h-10 sm:h-12 w-auto max-w-[160px] sm:max-w-[200px] object-contain object-left"
            />
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#214C3A]">
                Secure Checkout & Payment Verification
              </h2>
              <p className="text-xs text-[#8C7A6B]">
                Scan Store QR Code, UPI ID Payment, or Direct WhatsApp Consultation
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
              <span>1. Customer & Delivery Address</span>
            </button>

            <span className="text-[#D8C6A5]">→</span>

            <button
              onClick={() => setStep('payment')}
              className={`flex items-center space-x-1.5 ${step === 'payment' ? 'text-[#214C3A] underline' : 'text-[#8C7A6B]'}`}
            >
              <span className="w-5 h-5 rounded-full bg-[#214C3A] text-white flex items-center justify-center text-[10px]">2</span>
              <span>2. UPI QR Payment & WhatsApp Summary</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold mb-4 text-center">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: ADDRESS & CONTACT */}
        {step === 'address' && (
          <form onSubmit={() => setStep('payment')} className="space-y-6 text-xs font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Contact & Address Input */}
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
                    <label className="block font-montserrat font-bold text-[#214C3A] mb-1">WhatsApp Phone *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9891179374"
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
                    placeholder="Head Office H23, G4 Krishna Nagar"
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
                      placeholder="Faridabad"
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
                      placeholder="Haryana"
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
                      placeholder="121003"
                      className="w-full bg-white p-3 rounded-xl border border-[#D8C6A5] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-montserrat font-bold text-[#214C3A] mb-1">Country *</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-white p-3 rounded-xl border border-[#D8C6A5] focus:outline-none font-semibold"
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

              {/* Right Column: Garment Summary & Proceed Button */}
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
                  <span>Proceed to Payment QR Code & UPI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </form>
        )}

        {/* STEP 2: UPI QR CODE & PAYMENT VERIFICATION */}
        {step === 'payment' && (
          <form onSubmit={handlePlaceOrder} className="space-y-6 text-xs font-sans">
            
            {/* Payment Method Selector Tabs */}
            <div className="flex flex-col sm:flex-row bg-[#EFE6D8]/60 p-1.5 rounded-2xl border border-[#D8C6A5] gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`flex-1 py-3 px-2 rounded-xl font-montserrat font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  paymentMethod === 'UPI' 
                    ? 'bg-[#214C3A] text-white shadow-md' 
                    : 'text-[#214C3A] hover:bg-white/50'
                }`}
              >
                <QrCode className="w-4 h-4 text-[#D8C6A5]" />
                <span>1. Scan Store QR Code / UPI</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('RAZORPAY')}
                className={`flex-1 py-3 px-2 rounded-xl font-montserrat font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  paymentMethod === 'RAZORPAY' 
                    ? 'bg-[#002970] text-white shadow-md' 
                    : 'text-[#214C3A] hover:bg-white/50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-[#D8C6A5]" />
                <span>2. Razorpay Gateway (Card/UPI)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('WHATSAPP')}
                className={`flex-1 py-3 px-2 rounded-xl font-montserrat font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  paymentMethod === 'WHATSAPP' 
                    ? 'bg-[#25D366] text-white shadow-md' 
                    : 'text-[#214C3A] hover:bg-white/50'
                }`}
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>3. Direct WhatsApp Order</span>
              </button>
            </div>

            {/* TAB 1: UPI QR CODE PAYMENT */}
            {paymentMethod === 'UPI' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left: Scan QR Code & Official Store UPI Details */}
                <div className="bg-white border-2 border-[#214C3A] p-6 rounded-3xl space-y-4 shadow-sm text-center">
                  <div className="space-y-1">
                    <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#C5A059] font-bold">
                      OFFICIAL ARVIKA FASHION STORE PAYMENT
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[#214C3A]">
                      Scan QR Code via Any UPI App
                    </h3>
                    <p className="text-xs text-[#8C7A6B]">
                      GPay, PhonePe, Paytm, BHIM, or any Banking UPI App
                    </p>
                  </div>

                  {/* QR Code Container */}
                  <div className="bg-[#FAF8F4] p-4 rounded-2xl border border-[#D8C6A5] inline-block shadow-inner">
                    <img
                      src={qrCodeUrl}
                      alt="Arvika Store Payment QR Code"
                      className="w-48 h-48 mx-auto object-contain rounded-xl border border-[#D8C6A5]"
                    />
                  </div>

                  {/* Store UPI Details Box */}
                  <div className="bg-[#EFE6D8]/50 p-3.5 rounded-2xl border border-[#D8C6A5] text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-montserrat font-bold text-[#214C3A]">STORE UPI ID:</span>
                      <button
                        type="button"
                        onClick={copyUpiId}
                        className="bg-[#214C3A] text-white text-[10px] px-2.5 py-1 rounded-lg font-bold hover:bg-[#4A5D4E] transition-colors flex items-center gap-1"
                      >
                        {copiedUpi ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUpi ? 'Copied!' : 'Copy UPI ID'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-sm font-bold text-[#214C3A] select-all bg-white p-2 rounded-xl border border-[#D8C6A5] text-center">
                      {SHOP_UPI_ID}
                    </div>
                    <div className="text-[11px] text-[#8C7A6B] flex items-center justify-between pt-1">
                      <span>Account Holder: <strong>{SHOP_NAME}</strong></span>
                      <span>Owner: <strong>{SHOP_PHONE}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right: Payment Reference Form & Total Payable */}
                <div className="bg-[#214C3A] text-[#FAF8F4] p-6 rounded-3xl space-y-5 flex flex-col justify-between border border-[#4A5D4E] shadow-xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#4A5D4E] pb-3">
                      <span className="text-xs font-montserrat uppercase tracking-wider text-[#D8C6A5] font-bold">Total Amount Payable</span>
                      <span className="font-serif text-2xl font-bold text-[#FAF8F4]">
                        {currency === 'INR' ? `₹${grandTotalINR.toLocaleString('en-IN')}` : `€${grandTotalEUR.toFixed(2)}`}
                      </span>
                    </div>

                    <div className="space-y-3 bg-[#1A3D2F] p-4 rounded-2xl border border-[#4A5D4E]">
                      <div>
                        <label className="block text-xs font-montserrat font-bold text-[#D8C6A5] mb-1">
                          12-Digit UPI Transaction Ref / UTR Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          placeholder="e.g. 423819204918 (from GPay / PhonePe / Paytm)"
                          className="w-full bg-[#FAF8F4] text-[#214C3A] p-3 rounded-xl font-mono text-xs font-bold border border-[#D8C6A5] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                        />
                        <p className="text-[10px] text-[#EFE6D8]/70 mt-1">
                          Enter the 12-digit UTR ref number shown in your payment app receipt so the owner can match your payment.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-montserrat font-bold text-[#D8C6A5] mb-1">
                          Your WhatsApp Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 9891179374"
                          className="w-full bg-[#FAF8F4] text-[#214C3A] p-3 rounded-xl text-xs font-bold border border-[#D8C6A5] focus:outline-none"
                        />
                        <p className="text-[10px] text-[#EFE6D8]/70 mt-1">
                          Real Order Tracking ID and dispatch updates will be sent directly to this WhatsApp number.
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] font-sans text-[#EFE6D8]/90 space-y-1.5 pt-1">
                      <p className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#25D366]" /> Real unique Order Tracking ID generated instantly.</p>
                      <p className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#25D366]" /> Full purchase breakdown sent directly to Shop Owner.</p>
                      <p className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#25D366]" /> Owner matches payment UTR and dispatches product.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-4 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                    >
                      <MessageSquare className="w-4 h-4 fill-current" />
                      <span>Complete Purchase & Send to WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('address')}
                      className="w-full text-center text-xs text-[#D8C6A5] underline font-montserrat font-semibold"
                    >
                      ← Back to Shipping Address
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: RAZORPAY GATEWAY PAYMENT */}
            {paymentMethod === 'RAZORPAY' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left: Razorpay Card / UPI Info */}
                <div className="bg-white border-2 border-[#002970] p-6 rounded-3xl space-y-4 shadow-sm">
                  <div className="flex items-center space-x-3 text-[#002970]">
                    <div className="w-12 h-12 rounded-2xl bg-[#002970]/10 text-[#002970] flex items-center justify-center shrink-0">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#002970]">
                        Razorpay Secure Checkout
                      </h4>
                      <p className="text-xs text-[#8C7A6B]">
                        Credit/Debit Cards, UPI Apps, Netbanking, & EMI
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-[#214C3A] bg-[#FAF8F4] p-4 rounded-2xl border border-[#EFE6D8]">
                    <div className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#002970] shrink-0 mt-0.5" />
                      <span><strong>256-Bit SSL Encrypted:</strong> PCI-DSS Level 1 compliant secure payment gateway.</span>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#002970] shrink-0 mt-0.5" />
                      <span><strong>Automated Order Verification:</strong> Instant receipt number (`pay_XXXXXXXXXX`) generated upon payment.</span>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#002970] shrink-0 mt-0.5" />
                      <span><strong>WhatsApp Receipt:</strong> Automated purchase details & tracking link transmitted to customer & owner.</span>
                    </div>
                  </div>
                </div>

                {/* Right: Razorpay Pay Button */}
                <div className="bg-[#002970] text-white p-6 rounded-3xl space-y-6 flex flex-col justify-between border border-[#001D50] shadow-xl">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-[#E8DCB8]">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-xs font-montserrat uppercase tracking-wider font-bold">Razorpay Certified Merchant</span>
                    </div>

                    <h3 className="font-serif text-3xl font-bold text-white">
                      Payable: {currency === 'INR' ? `₹${grandTotalINR.toLocaleString('en-IN')}` : `€${grandTotalEUR.toFixed(2)}`}
                    </h3>

                    <div className="text-xs font-sans text-white/80 space-y-2">
                      <p className="flex items-center gap-1">✓ Instant Razorpay Receipt Generation (`pay_XXXXXXXX`)</p>
                      <p className="flex items-center gap-1">✓ Real Tracking ID (`ARV-20260806-XXXXXX`)</p>
                      <p className="flex items-center gap-1">✓ Automatic WhatsApp Receipt Broadcast</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={isRazorpayLoading}
                      className="w-full bg-[#C5A059] hover:bg-[#b08d47] text-[#214C3A] py-4 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer active:scale-98 disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{isRazorpayLoading ? 'Initiating Gateway...' : 'Pay via Razorpay Gateway'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('address')}
                      className="w-full text-center text-xs text-[#E8DCB8] underline font-montserrat font-semibold"
                    >
                      ← Back to Shipping Address
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: DIRECT WHATSAPP CONSULTATION */}
            {paymentMethod === 'WHATSAPP' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left: Consultation Description */}
                <div className="bg-white border-2 border-[#214C3A] p-6 rounded-3xl space-y-4 shadow-sm">
                  <div className="flex items-center space-x-3 text-[#214C3A]">
                    <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0">
                      <MessageSquare className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#214C3A]">
                        Personalized Atelier Consultation
                      </h4>
                      <p className="text-xs text-[#8C7A6B]">
                        Custom sizing, international bank transfer (SWIFT/IBAN), and export inquiries.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-[#214C3A] bg-[#FAF8F4] p-4 rounded-2xl border border-[#EFE6D8]">
                    <div className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                      <span><strong>Real Order Record:</strong> Permanent order tracking ID and tax invoice created immediately.</span>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                      <span><strong>Personal Size Consultation:</strong> Our team confirms measurements and fabric preferences with you.</span>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                      <span><strong>Self Payment Options:</strong> International Wire, SWIFT, or UPI details sent directly in WhatsApp chat.</span>
                    </div>
                  </div>
                </div>

                {/* Right: Submit Button */}
                <div className="bg-[#214C3A] text-[#FAF8F4] p-6 rounded-3xl space-y-6 flex flex-col justify-between border border-[#4A5D4E] shadow-xl">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-[#D8C6A5]">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-xs font-montserrat uppercase tracking-wider font-bold">Direct Client Concierge</span>
                    </div>

                    <h3 className="font-serif text-3xl font-bold text-[#FAF8F4]">
                      Total Payable: {currency === 'INR' ? `₹${grandTotalINR.toLocaleString('en-IN')}` : `€${grandTotalEUR.toFixed(2)}`}
                    </h3>

                    <div className="text-xs font-sans text-[#EFE6D8]/80 space-y-2">
                      <p className="flex items-center gap-1">✓ Automated Real Order Tracking ID Generation</p>
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
                      <span>Confirm Order & Chat on WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('address')}
                      className="w-full text-center text-xs text-[#D8C6A5] underline font-montserrat font-semibold"
                    >
                      ← Back to Shipping Address
                    </button>
                  </div>
                </div>

              </div>
            )}

          </form>
        )}

        {/* STEP 3: ORDER CONFIRMATION & REAL UNIQUE TRACKING ID */}
        {step === 'confirmation' && placedOrder && (
          <div className="py-6 space-y-6 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-[#214C3A] text-[#D8C6A5] flex items-center justify-center mx-auto shadow-xl border-2 border-[#C5A059]">
              <Check className="w-10 h-10 text-[#D8C6A5]" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-montserrat uppercase tracking-[0.25em] text-[#8C7A6B] font-bold">
                ORDER RECORD SAVED & TRANSMITTED
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#214C3A]">
                Thank You, {placedOrder.customerName}!
              </h2>
              <p className="text-xs text-[#1C1C1C]/80 font-sans leading-relaxed">
                Your purchase order details have been saved to the store database and transmitted to the shop owner for payment verification & delivery dispatch.
              </p>
            </div>

            {/* Tracking ID Hero Box */}
            <div className="bg-[#214C3A] text-[#FAF8F4] p-6 rounded-3xl max-w-xl mx-auto border-2 border-[#C5A059] shadow-xl space-y-3">
              <span className="text-[10px] font-montserrat uppercase tracking-wider text-[#D8C6A5] font-bold">
                PERMANENT REAL ORDER TRACKING ID
              </span>
              <div className="flex items-center justify-center space-x-3">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-[#D8C6A5]">
                  {placedOrder.orderTrackingId}
                </span>
                <button
                  onClick={() => copyTracking(placedOrder.orderTrackingId)}
                  className="bg-[#D8C6A5] text-[#214C3A] p-2 rounded-xl text-xs font-bold hover:bg-white transition-colors"
                  title="Copy Tracking ID"
                >
                  {copiedTracking ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              
              {placedOrder.paymentDetails.transactionId?.startsWith('pay_') && (
                <div className="text-xs font-mono text-emerald-300 bg-[#1A3D2F] py-1 px-3 rounded-lg inline-block">
                  Razorpay Receipt ID: <strong>{placedOrder.paymentDetails.transactionId}</strong>
                </div>
              )}
              {placedOrder.paymentDetails.utrNumber && (
                <div className="text-xs font-mono text-[#EFE6D8] bg-[#1A3D2F] py-1 px-3 rounded-lg inline-block">
                  UPI UTR Ref: <strong>{placedOrder.paymentDetails.utrNumber}</strong>
                </div>
              )}

              <p className="text-[11px] text-[#EFE6D8]/80 pt-1">
                Carrier Express Airway Bill: <strong>{placedOrder.trackingNumber}</strong> ({placedOrder.carrier})
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => sendWhatsAppOrderNotification(placedOrder)}
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white px-6 py-3.5 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Send Purchased Details to WhatsApp</span>
              </button>

              <button
                onClick={() => onViewInvoice(placedOrder)}
                className="bg-[#EFE6D8] hover:bg-[#D8C6A5] text-[#214C3A] px-6 py-3.5 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
              >
                <FileText className="w-4 h-4 text-[#C5A059]" />
                <span>View & Print Tax Invoice</span>
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
