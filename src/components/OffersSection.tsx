import React, { useState } from 'react';
import { Tag, Sparkles, Check, Copy, Percent, Gift, ArrowRight } from 'lucide-react';
import { Coupon, Currency } from '../types';
import { COUPONS } from '../data/offers';

interface OffersSectionProps {
  currency: Currency;
  onApplyCoupon: (code: string) => void;
  activeCouponCode: string | null;
  onGoToShop: () => void;
}

export const OffersSection: React.FC<OffersSectionProps> = ({
  currency,
  onApplyCoupon,
  activeCouponCode,
  onGoToShop
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    onApplyCoupon(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <section className="py-20 bg-[#FAF8F4] border-t border-[#EAE2D7] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-montserrat uppercase tracking-[0.25em] text-[#7B9B88] font-bold flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#7B9B88]" />
          EXCLUSIVE EUROPEAN PROMOTIONS
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2A26]">
          Active Offers & Coupon Codes
        </h2>
        <p className="text-xs text-[#2D2A26]/75 font-sans leading-relaxed">
          Apply promotional codes during checkout or click below to activate instant discounts on your order.
        </p>
      </div>

      {/* Coupon Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {COUPONS.map((coupon) => {
          const isApplied = activeCouponCode === coupon.code;
          const minSpend = currency === 'INR' ? `₹${coupon.minOrderINR.toLocaleString('en-IN')}` : `€${coupon.minOrderEUR}`;

          return (
            <div
              key={coupon.code}
              className={`relative bg-white border rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 ${
                isApplied ? 'border-[#7B9B88] ring-2 ring-[#7B9B88]/20 bg-[#E8F0EC]/30' : 'border-[#EAE2D7]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-[#7B9B88] text-white text-[10px] font-montserrat font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {coupon.badge}
                  </span>
                  {isApplied && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-montserrat font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" /> Active in Cart
                    </span>
                  )}
                </div>

                <div className="flex items-baseline space-x-2">
                  <span className="font-mono text-2xl font-extrabold text-[#2D2A26] tracking-wider bg-[#E8F0EC] px-3 py-1 rounded-xl border border-[#D5E4DC]">
                    {coupon.code}
                  </span>
                </div>

                <p className="text-sm font-serif font-bold text-[#2D2A26] leading-snug">
                  {coupon.description}
                </p>

                <p className="text-xs text-[#7B9B88] font-sans">
                  Minimum Order Value: <strong>{minSpend}</strong> • Valid through {coupon.expiresAt}
                </p>
              </div>

              <div className="pt-4 border-t border-[#EAE2D7] flex items-center justify-between gap-4">
                <button
                  onClick={() => handleCopy(coupon.code)}
                  className={`flex-1 py-3 px-4 rounded-xl font-montserrat text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    copiedCode === coupon.code || isApplied
                      ? 'bg-[#7B9B88] text-white'
                      : 'bg-[#E8F0EC] hover:bg-[#D5E4DC] text-[#2D2A26]'
                  }`}
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>Code Copied & Applied!</span>
                    </>
                  ) : isApplied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>Applied to Cart</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#7B9B88]" />
                      <span>Copy & Apply Code</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onGoToShop}
                  className="bg-white hover:bg-[#FAF8F4] text-[#7B9B88] border border-[#7B9B88] px-4 py-3 rounded-xl font-montserrat text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};
