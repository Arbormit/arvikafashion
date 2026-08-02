import React, { useState } from 'react';
import { X, ChevronUp, ExternalLink, Send, Check, Trash2 } from 'lucide-react';
import { WhatsAppProductContext, Currency } from '../types';
import { SHOP_PHONE, SHOP_NAME } from '../services/db';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="0"
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface FloatingWhatsAppCTAProps {
  productContext: WhatsAppProductContext | null;
  currency: Currency;
  onClearProductContext?: () => void;
}

export const FloatingWhatsAppCTA: React.FC<FloatingWhatsAppCTAProps> = ({
  productContext,
  currency,
  onClearProductContext
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [copied, setCopied] = useState(false);

  const product = productContext?.product;
  const color = productContext?.selectedColor || (product?.colors[0]?.name ?? 'Standard');
  const size = productContext?.selectedSize || (product?.sizes[0] ?? 'M');
  const quantity = productContext?.quantity || 1;
  const coupon = productContext?.appliedCoupon;

  // Price formatting
  const formattedPrice = product
    ? currency === 'INR'
      ? `₹${(product.priceINR * quantity).toLocaleString('en-IN')}`
      : `€${(product.priceEUR * quantity).toFixed(2)}`
    : '';

  // Generate dynamic WhatsApp Message
  const buildWhatsAppMessage = (): string => {
    if (!product) {
      return `Hello ${SHOP_NAME}! 👋 I am browsing your luxury organic linen collection and would like to speak with a concierge regarding custom orders and sizing.`;
    }

    const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/#product-${product.id}` : '';
    let msg = `Hello ${SHOP_NAME}! 👋 I would like to enquire / place an order for:\n\n`;
    msg += `🛍️ *Product:* ${product.name}\n`;
    msg += `🏷️ *SKU:* ${product.sku}\n`;
    msg += `📂 *Category:* ${product.categoryName}\n`;
    msg += `🎨 *Selected Color:* ${color}\n`;
    msg += `📏 *Selected Size:* ${size}\n`;
    msg += `🔢 *Quantity:* ${quantity}\n`;
    msg += `💰 *Price:* ${formattedPrice}\n`;
    if (coupon) {
      msg += `🏷️ *Applied Offer:* ${coupon.code} (${coupon.description})\n`;
    }
    msg += `🔗 *Product Link:* ${currentUrl}\n`;
    if (customNote.trim()) {
      msg += `💬 *Custom Note / Request:* "${customNote.trim()}"\n`;
    }
    msg += `\nPlease guide me on availability, customization, and express dispatch!`;

    return msg;
  };

  const handleOpenWhatsApp = () => {
    const message = buildWhatsAppMessage();
    const phoneClean = SHOP_PHONE.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(buildWhatsAppMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end font-sans">
      
      {/* Floating Card Popup */}
      {isOpen && (
        <div className="mb-4 bg-[#FAF8F4] border border-[#D8C6A5] rounded-3xl p-5 shadow-2xl max-w-sm w-[90vw] sm:w-96 animate-fade-in text-xs space-y-4">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#EFE6D8]">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md">
                <WhatsAppIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-[#214C3A] text-sm">Arvika Concierge WhatsApp</h4>
                <p className="text-[10px] text-[#8C7A6B]">Instant Direct Store Enquiries</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-[#8C7A6B] hover:text-[#214C3A] hover:bg-[#EFE6D8] rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Product Context Preview */}
          {product ? (
            <div className="bg-white p-3.5 rounded-2xl border border-[#EFE6D8] space-y-2">
              <div className="flex items-center space-x-3">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-14 h-16 object-cover rounded-xl border border-[#EFE6D8]"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] uppercase font-montserrat font-bold text-[#8C7A6B] bg-[#EFE6D8] px-2 py-0.5 rounded-full">
                    SKU: {product.sku}
                  </span>
                  <h5 className="font-serif font-bold text-[#214C3A] truncate text-xs mt-1">{product.name}</h5>
                  <div className="text-[11px] text-[#8C7A6B]">
                    {color} • Size {size} • Qty {quantity}
                  </div>
                  <div className="font-serif font-bold text-emerald-800 text-xs mt-0.5">
                    {formattedPrice}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#EFE6D8]/80">
                {coupon ? (
                  <div className="text-[10px] bg-emerald-50 text-emerald-800 p-1.5 rounded-lg border border-emerald-200 flex items-center gap-1 font-semibold">
                    <span>Offer: <strong>{coupon.code}</strong></span>
                  </div>
                ) : <div />}

                {onClearProductContext && (
                  <button
                    onClick={onClearProductContext}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 text-[10px] font-montserrat font-bold px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                    title="Remove product context from WhatsApp message"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove Item from String</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#EFE6D8]/50 p-3 rounded-xl text-[11px] text-[#214C3A] space-y-1">
              <p className="font-bold">General Concierge Support</p>
              <p className="text-[10px] opacity-80">Connect directly with our atelier team for bespoke sizing, fabric samples, or bulk order enquiries.</p>
            </div>
          )}

          {/* Custom Note Input */}
          <div>
            <label className="block text-[10px] font-montserrat font-bold text-[#214C3A] mb-1">
              Add Personal Note / Customization Request:
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Can you dispatch by Friday? Need sleeve alteration."
              className="w-full bg-white p-2.5 rounded-xl border border-[#D8C6A5] text-xs focus:outline-none focus:ring-1 focus:ring-[#214C3A]"
            />
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleOpenWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>Start WhatsApp Chat Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleCopyMessage}
              className="w-full bg-white border border-[#D8C6A5] text-[#214C3A] py-2 rounded-xl text-[11px] font-montserrat font-semibold hover:bg-[#EFE6D8] transition-all flex items-center justify-center space-x-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Message Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Copy Formatted Order Message</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20ba5a] text-white border-2 border-white/80 p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center animate-fade-in group cursor-pointer"
        aria-label="Contact Store via WhatsApp"
        title="WhatsApp Store Concierge"
      >
        <WhatsAppIcon className="w-5 h-5 text-white transition-transform duration-300 group-hover:scale-110" />
        
        {/* Active Context Badge */}
        {productContext && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#214C3A] text-[#D8C6A5] text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
            1
          </span>
        )}
      </button>

    </div>
  );
};
