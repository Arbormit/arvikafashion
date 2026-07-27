import React, { useState } from 'react';
import { MessageSquare, Sparkles, X, ChevronUp, ExternalLink, Send, Check } from 'lucide-react';
import { WhatsAppProductContext, Currency } from '../types';
import { SHOP_PHONE, SHOP_NAME } from '../services/db';

interface FloatingWhatsAppCTAProps {
  productContext: WhatsAppProductContext | null;
  currency: Currency;
}

export const FloatingWhatsAppCTA: React.FC<FloatingWhatsAppCTAProps> = ({
  productContext,
  currency
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
                <MessageSquare className="w-4 h-4 fill-current" />
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

              {coupon && (
                <div className="text-[10px] bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-200 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Offer Active: <strong>{coupon.code}</strong></span>
                </div>
              )}
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
              <MessageSquare className="w-4 h-4 fill-current" />
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
        className="group relative bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center space-x-2 border-2 border-white"
        aria-label="Contact Store via WhatsApp"
      >
        <MessageSquare className="w-6 h-6 fill-current" />
        
        {/* Unread / Active Context Badge */}
        {productContext && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#214C3A] text-[#D8C6A5] text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
            1
          </span>
        )}

        <span className="hidden sm:inline font-montserrat text-xs font-bold uppercase tracking-wider pr-1">
          WhatsApp Store Concierge
        </span>
      </button>

    </div>
  );
};
