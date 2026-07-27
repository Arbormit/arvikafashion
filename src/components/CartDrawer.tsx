import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  Tag, 
  Check, 
  ArrowRight, 
  Truck, 
  Sparkles,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { CartItem, Currency, Coupon, User } from '../types';
import { COUPONS } from '../data/offers';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currency: Currency;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  appliedCoupon: Coupon | null;
  setAppliedCoupon: (coupon: Coupon | null) => void;
  onProceedToCheckout: () => void;
  user: User;
  onOpenAuth: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  appliedCoupon,
  setAppliedCoupon,
  onProceedToCheckout,
  user,
  onOpenAuth
}) => {
  if (!isOpen) return null;

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  // Financial calculations
  const subtotalINR = cart.reduce((sum, item) => sum + item.product.priceINR * item.quantity, 0);
  const subtotalEUR = cart.reduce((sum, item) => sum + item.product.priceEUR * item.quantity, 0);

  const subtotal = currency === 'INR' ? subtotalINR : subtotalEUR;

  // Free shipping threshold (₹8,000 or €100)
  const freeShipThreshold = currency === 'INR' ? 8000 : 100;
  const freeShipRemaining = Math.max(0, freeShipThreshold - subtotal);
  const freeShipProgress = Math.min(100, (subtotal / freeShipThreshold) * 100);

  // Discount calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercentage) {
      discountAmount = (subtotal * appliedCoupon.discountPercentage) / 100;
    } else if (currency === 'INR' && appliedCoupon.discountFixedINR) {
      discountAmount = appliedCoupon.discountFixedINR;
    } else if (currency === 'EUR' && appliedCoupon.discountFixedEUR) {
      discountAmount = appliedCoupon.discountFixedEUR;
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);

    const match = COUPONS.find(c => c.code.toUpperCase() === couponInput.trim().toUpperCase());
    if (!match) {
      setCouponError('Invalid coupon code. Try EUROPE15 or LINEN20');
      return;
    }

    const minSpend = currency === 'INR' ? match.minOrderINR : match.minOrderEUR;
    if (subtotal < minSpend) {
      setCouponError(`Minimum order value for ${match.code} is ${currency === 'INR' ? `₹${match.minOrderINR}` : `€${match.minOrderEUR}`}`);
      return;
    }

    setAppliedCoupon(match);
    setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F4] border-l border-[#EFE6D8] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 bg-[#214C3A] text-[#FAF8F4] flex items-center justify-between border-b border-[#4A5D4E]">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#D8C6A5]" />
              <h2 className="font-serif text-2xl font-bold tracking-wide">Your Shopping Bag</h2>
              <span className="bg-[#1A3D2F] text-[#D8C6A5] text-xs px-2.5 py-0.5 rounded-full font-montserrat font-bold">
                {cart.reduce((s, i) => s + i.quantity, 0)} Items
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-[#FAF8F4]/80 hover:text-white rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-[#EFE6D8]/60 p-4 border-b border-[#D8C6A5]/50 text-xs font-sans">
            {freeShipRemaining > 0 ? (
              <div className="space-y-1.5 text-[#214C3A]">
                <div className="flex justify-between font-semibold">
                  <span>Free Express Worldwide Shipping</span>
                  <span>Add {currency === 'INR' ? `₹${freeShipRemaining.toLocaleString('en-IN')}` : `€${freeShipRemaining}`} more</span>
                </div>
                <div className="h-2 bg-[#D8C6A5]/50 rounded-full overflow-hidden">
                  <div className="h-full bg-[#214C3A] transition-all duration-500" style={{ width: `${freeShipProgress}%` }} />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>Unlocked Free Express Global DHL Delivery!</span>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-[#EFE6D8]">
            {cart.length > 0 ? (
              cart.map((item) => {
                const itemPrice = currency === 'INR' 
                  ? `₹${(item.product.priceINR * item.quantity).toLocaleString('en-IN')}`
                  : `€${item.product.priceEUR * item.quantity}`;

                return (
                  <div key={item.id} className="pt-4 first:pt-0 flex space-x-4 items-start">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-24 rounded-xl object-cover border border-[#D8C6A5] flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif font-bold text-sm text-[#214C3A] leading-snug">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Remove item from Cart"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-[11px] font-sans text-[#8C7A6B]">
                        Shade: <strong>{item.color}</strong> • Size: <strong>{item.size}</strong>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center border border-[#D8C6A5] rounded-lg overflow-hidden bg-white text-xs font-bold">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-[#214C3A] hover:bg-[#EFE6D8]"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 font-mono">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-[#214C3A] hover:bg-[#EFE6D8]"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-serif font-bold text-base text-[#214C3A]">
                          {itemPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-[#D8C6A5] mx-auto" />
                <p className="font-serif text-xl font-bold text-[#214C3A]">
                  Your cart is currently empty
                </p>
                <p className="text-xs text-[#8C7A6B] font-sans">
                  Explore our pure organic linen and cotton collections.
                </p>
              </div>
            )}
          </div>

          {/* Checkout & Summary Footer */}
          {cart.length > 0 && (
            <div className="p-6 bg-white border-t border-[#EFE6D8] space-y-4">
              
              {/* Coupon input */}
              <form onSubmit={handleApplyCoupon} className="space-y-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Promo Code (EUROPE15)"
                      className="w-full bg-[#FAF8F4] pl-9 pr-3 py-2 rounded-xl text-xs font-mono uppercase border border-[#D8C6A5] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#214C3A] text-[#FAF8F4] px-4 py-2 rounded-xl text-xs font-montserrat font-bold hover:bg-[#4A5D4E]"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-red-600 font-sans">{couponError}</p>}
                {appliedCoupon && (
                  <div className="text-[11px] text-emerald-800 font-montserrat font-bold flex justify-between items-center bg-emerald-50 p-2 rounded-lg border border-emerald-200 mt-1">
                    <span>Active Promo: {appliedCoupon.code}</span>
                    <button 
                      type="button" 
                      onClick={() => setAppliedCoupon(null)} 
                      className="text-red-700 underline text-[10px]"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs font-sans text-[#1C1C1C]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-serif font-bold text-[#214C3A]">
                    {currency === 'INR' ? `₹${subtotalINR.toLocaleString('en-IN')}` : `€${subtotalEUR}`}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Promo Discount ({appliedCoupon?.code})</span>
                    <span>-{currency === 'INR' ? `₹${discountAmount.toLocaleString('en-IN')}` : `€${discountAmount.toFixed(2)}`}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-sm text-[#214C3A] pt-2 border-t border-[#EFE6D8]">
                  <span>Grand Total</span>
                  <span className="font-serif text-xl">
                    {currency === 'INR' ? `₹${grandTotal.toLocaleString('en-IN')}` : `€${grandTotal.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Proceed Options for Logged In User vs Guest Visitor */}
              {!user.isLoggedIn ? (
                <div className="space-y-2.5 pt-1">
                  <div className="bg-[#EFE6D8]/50 p-2.5 rounded-xl border border-[#D8C6A5] text-[11px] font-sans text-[#214C3A]">
                    <span>💡 Shopping as a <strong>Guest Visitor</strong>. Sign in to place an order online with tracking, or order directly via WhatsApp.</span>
                  </div>

                  {/* 1. Login to Complete Purchase */}
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="w-full bg-[#214C3A] hover:bg-[#1A3D2F] text-[#FAF8F4] py-3.5 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                  >
                    <Sparkles className="w-4 h-4 text-[#D8C6A5]" />
                    <span>Sign In / Register to Checkout</span>
                  </button>

                  {/* 2. Direct WhatsApp Order with Cart String */}
                  <button
                    onClick={() => {
                      let msg = `Hello Arvika Fashion! 👋 I am a guest customer inquiring about placing an export order for my cart:\n\n`;
                      msg += `🛍️ *SELECTED CART ITEMS:*\n`;
                      cart.forEach((item, idx) => {
                        const itemPrice = currency === 'INR' ? `₹${(item.product.priceINR * item.quantity).toLocaleString('en-IN')}` : `€${(item.product.priceEUR * item.quantity).toFixed(2)}`;
                        msg += `${idx + 1}. *${item.product.name}* (${item.color}, Size: ${item.size}) x${item.quantity} - ${itemPrice}\n`;
                      });
                      msg += `\n💰 *Cart Total:* ${currency === 'INR' ? `₹${grandTotal.toLocaleString('en-IN')}` : `€${grandTotal.toFixed(2)}`}`;
                      if (appliedCoupon) {
                        msg += `\n🏷️ *Applied Promo:* ${appliedCoupon.code}`;
                      }
                      msg += `\n\nCould you please assist me with guest checkout & dispatch details?`;

                      window.open(`https://wa.me/919891179374?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3.5 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Direct WhatsApp Order with Selected Items</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={onProceedToCheckout}
                  className="w-full bg-[#214C3A] hover:bg-[#1A3D2F] text-[#FAF8F4] py-4 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-[#D8C6A5]" />
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
