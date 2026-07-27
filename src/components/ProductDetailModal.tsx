import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  Sparkles, 
  Ruler, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Check, 
  Share2, 
  ChevronRight,
  Star,
  Leaf
} from 'lucide-react';
import { Product, Currency } from '../types';
import { SizeGuideModal } from './SizeGuideModal';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onAddToCart: (product: Product, color: string, size: string, quantity: number) => void;
  onBuyNow: (product: Product, color: string, size: string, quantity: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  currency,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted
}) => {
  if (!isOpen || !product) return null;

  const [selectedImage, setSelectedImage] = useState(product.images[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Default');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'fabric' | 'origin' | 'shipping'>('details');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const price = currency === 'INR' 
    ? `₹${product.priceINR.toLocaleString('en-IN')}` 
    : `€${product.priceEUR}`;

  const originalPrice = product.originalPriceINR && product.originalPriceEUR
    ? currency === 'INR'
      ? `₹${product.originalPriceINR.toLocaleString('en-IN')}`
      : `€${product.originalPriceEUR}`
    : null;

  const handleAddToCart = () => {
    onAddToCart(product, selectedColor, selectedSize, quantity);
    setToastMessage('Added to your Shopping Cart');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleBuyNow = () => {
    onBuyNow(product, selectedColor, selectedSize, quantity);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6 animate-fade-in overflow-y-auto">
        <div className="bg-[#FAF8F4] border border-[#EFE6D8] rounded-3xl max-w-5xl w-full p-6 sm:p-8 relative shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 p-2.5 text-[#1C1C1C]/70 hover:text-[#214C3A] bg-[#EFE6D8]/60 hover:bg-[#EFE6D8] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 bg-[#214C3A] text-[#D8C6A5] px-5 py-2.5 rounded-full text-xs font-montserrat font-bold shadow-xl border border-[#C5A059] flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Gallery Section */}
            <div className="space-y-4">
              <div className="relative aspect-[3/4] w-full bg-[#EFE6D8]/40 rounded-2xl overflow-hidden border border-[#EFE6D8]">
                <img
                  src={selectedImage || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                
                {/* Wishlist Button */}
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`absolute top-4 right-4 p-3 rounded-full transition-all z-10 ${
                    isWishlisted ? 'bg-[#214C3A] text-[#FAF8F4] shadow-lg' : 'bg-white/80 hover:bg-white text-[#1C1C1C]'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#D8C6A5] text-[#D8C6A5]' : ''}`} />
                </button>
              </div>

              {/* Thumbnails */}
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      (selectedImage === img || (!selectedImage && idx === 0))
                        ? 'border-[#214C3A] ring-2 ring-[#214C3A]/20 scale-105'
                        : 'border-[#EFE6D8] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>

            {/* Content Info Section */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs font-montserrat uppercase tracking-wider text-[#8C7A6B]">
                  <span className="bg-[#EFE6D8] px-3 py-1 rounded-full text-[#214C3A] font-bold">
                    {product.categoryName}
                  </span>
                  <div className="flex items-center space-x-1 text-[#214C3A] font-bold">
                    <Star className="w-4 h-4 fill-[#C5A059] text-[#C5A059]" />
                    <span>{product.rating} ({product.reviewCount} Reviews)</span>
                  </div>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#214C3A] mt-3 leading-tight">
                  {product.name}
                </h1>
                
                <p className="text-sm font-sans text-[#8C7A6B] mt-1 font-medium">
                  {product.subtitle || product.fabric}
                </p>

                {/* Price Display */}
                <div className="mt-4 flex items-baseline space-x-3">
                  <span className="font-serif text-3xl font-bold text-[#214C3A]">{price}</span>
                  {originalPrice && (
                    <span className="text-base text-[#8C7A6B] line-through font-sans">{originalPrice}</span>
                  )}
                  <span className="text-xs font-montserrat font-bold bg-[#214C3A] text-[#D8C6A5] px-2.5 py-0.5 rounded-full">
                    Includes GST & Taxes
                  </span>
                </div>

                {/* Offer Notification Banner */}
                <div className="mt-4 bg-[#214C3A]/10 border border-[#214C3A]/20 p-3 rounded-xl flex items-center gap-2 text-xs font-sans text-[#214C3A]">
                  <Sparkles className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
                  <span>Eligible for <strong>15% OFF</strong> with promo code <strong className="underline cursor-pointer">EUROPE15</strong> at checkout.</span>
                </div>

                {/* Color Selector */}
                <div className="mt-6">
                  <label className="text-xs font-montserrat uppercase tracking-wider font-bold text-[#214C3A] block mb-2">
                    Select Color Shade: <span className="font-normal text-[#1C1C1C]">{selectedColor}</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {product.colors.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(color.name)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-sans transition-all ${
                          selectedColor === color.name
                            ? 'border-[#214C3A] bg-[#214C3A] text-[#FAF8F4] font-semibold shadow-sm'
                            : 'border-[#D8C6A5] bg-white text-[#1C1C1C] hover:bg-[#EFE6D8]'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: color.hex }} />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selector */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-montserrat uppercase tracking-wider font-bold text-[#214C3A]">
                      Select Size: <span className="font-normal text-[#1C1C1C]">{selectedSize}</span>
                    </label>
                    <button
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="text-xs text-[#214C3A] hover:underline flex items-center gap-1 font-montserrat font-semibold"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Size Chart</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[48px] py-2 px-3 rounded-xl text-xs font-montserrat font-bold border transition-all ${
                          selectedSize === size
                            ? 'bg-[#214C3A] text-[#FAF8F4] border-[#214C3A] shadow-md'
                            : 'bg-white text-[#1C1C1C] border-[#D8C6A5] hover:border-[#214C3A]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="mt-6 flex items-center space-x-4">
                  <label className="text-xs font-montserrat uppercase tracking-wider font-bold text-[#214C3A]">
                    Quantity:
                  </label>
                  <div className="flex items-center border border-[#D8C6A5] rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-lg font-bold text-[#214C3A] hover:bg-[#EFE6D8]"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-montserrat font-bold text-[#1C1C1C]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-1.5 text-lg font-bold text-[#214C3A] hover:bg-[#EFE6D8]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="pt-4 border-t border-[#EFE6D8] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="bg-[#EFE6D8] hover:bg-[#D8C6A5] text-[#214C3A] py-3.5 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="bg-[#214C3A] hover:bg-[#4A5D4E] text-[#FAF8F4] py-3.5 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#D8C6A5]" />
                    <span>Buy Now</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    const priceFormatted = currency === 'INR' ? `₹${(product.priceINR * quantity).toLocaleString('en-IN')}` : `€${(product.priceEUR * quantity).toFixed(2)}`;
                    let msg = `Hello Arvika Fashion! 👋 I am interested in inquiring about:\n\n`;
                    msg += `🛍️ *Product:* ${product.name}\n`;
                    msg += `🏷️ *SKU:* ${product.sku}\n`;
                    msg += `🎨 *Selected Color:* ${selectedColor}\n`;
                    msg += `📏 *Selected Size:* ${selectedSize}\n`;
                    msg += `🔢 *Quantity:* ${quantity}\n`;
                    msg += `💰 *Price:* ${priceFormatted}\n`;
                    msg += `\nCould you please assist me with custom sizing and dispatch time?`;
                    
                    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Enquire / Custom Order via WhatsApp</span>
                </button>
              </div>

              {/* Tabs Info Section */}
              <div className="pt-2">
                <div className="flex border-b border-[#EFE6D8] space-x-4 text-xs font-montserrat uppercase tracking-wider font-bold">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-2 transition-colors border-b-2 ${
                      activeTab === 'details' ? 'border-[#214C3A] text-[#214C3A]' : 'text-[#8C7A6B] border-transparent'
                    }`}
                  >
                    Garment Story
                  </button>
                  <button
                    onClick={() => setActiveTab('fabric')}
                    className={`pb-2 transition-colors border-b-2 ${
                      activeTab === 'fabric' ? 'border-[#214C3A] text-[#214C3A]' : 'text-[#8C7A6B] border-transparent'
                    }`}
                  >
                    Fabric & GSM
                  </button>
                  <button
                    onClick={() => setActiveTab('origin')}
                    className={`pb-2 transition-colors border-b-2 ${
                      activeTab === 'origin' ? 'border-[#214C3A] text-[#214C3A]' : 'text-[#8C7A6B] border-transparent'
                    }`}
                  >
                    Ethical Origin
                  </button>
                  <button
                    onClick={() => setActiveTab('shipping')}
                    className={`pb-2 transition-colors border-b-2 ${
                      activeTab === 'shipping' ? 'border-[#214C3A] text-[#214C3A]' : 'text-[#8C7A6B] border-transparent'
                    }`}
                  >
                    Export Shipping
                  </button>
                </div>

                <div className="py-3 text-xs font-sans text-[#1C1C1C]/80 leading-relaxed min-h-[80px]">
                  {activeTab === 'details' && (
                    <p>{product.description}</p>
                  )}
                  {activeTab === 'fabric' && (
                    <ul className="space-y-1 list-disc pl-4">
                      <li><strong>Material:</strong> {product.fabric}</li>
                      {product.gsm && <li><strong>Fabric Weight:</strong> {product.gsm} GSM</li>}
                      <li><strong>Fit Profile:</strong> {product.fit}</li>
                      <li><strong>Care:</strong> Machine wash cold (30°C), hang dry in shade, iron damp.</li>
                    </ul>
                  )}
                  {activeTab === 'origin' && (
                    <p>{product.sustainabilityNotes}</p>
                  )}
                  {activeTab === 'shipping' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[#214C3A] font-semibold">
                        <Truck className="w-4 h-4" />
                        <span>Express Air Dispatch: 24-48 Hours</span>
                      </div>
                      <p>Doorstep delivery via BlueDart (India) & DHL Express Worldwide (Europe & Global). Free shipping on orders over ₹10,000 / €120.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </>
  );
};
