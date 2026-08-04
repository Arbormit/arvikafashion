import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  Ruler, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Check, 
  Share2, 
  ChevronRight,
  Star,
  Leaf,
  ArrowLeft
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
  isAddedToCart?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  currency,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  isAddedToCart = false
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
      {/* Universal Full Page Product Detail Showcase Container */}
      <div className="fixed inset-0 z-50 bg-[#FAF8F4] overflow-y-auto w-full h-full min-h-screen animate-fade-in font-sans">
        
        {/* Universal Top Header Bar (Compact & Elegant on Mobile/Tablet) */}
        <header className="sticky top-0 z-40 bg-[#FAF8F4]/95 backdrop-blur-md border-b border-[#EAE2D7] px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-xs">
          <button
            onClick={onClose}
            className="p-2.5 md:px-4 md:py-2 rounded-full bg-[#E8F0EC] hover:bg-[#D5E4DC] text-[#2D2A26] transition-colors shadow-xs flex items-center space-x-2 cursor-pointer shrink-0 active:scale-95"
            aria-label="Back to Store"
            title="Back to Store"
          >
            <ArrowLeft className="w-5 h-5 md:w-4 md:h-4 text-[#7B9B88]" />
            <span className="hidden md:inline text-xs font-montserrat font-bold">Back to Store Collections</span>
          </button>

          <div className="flex flex-col items-center text-center px-2 min-w-0">
            <img
              src="/logo.png"
              alt="Arvika Fashion Logo"
              className="h-10 sm:h-12 w-auto max-w-[160px] sm:max-w-[200px] object-contain"
            />
            <span className="text-[8px] sm:text-[9px] font-montserrat uppercase tracking-widest text-[#7B9B88] font-semibold mt-0.5 truncate max-w-[150px] sm:max-w-none">
              {product.categoryName} • EXPORT EDITION
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleWishlist(product)}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                isWishlisted ? 'bg-[#7B9B88] text-white shadow-md' : 'bg-[#E8F0EC] hover:bg-[#D5E4DC] text-[#2D2A26]'
              }`}
              title="Wishlist Product"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white text-white' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 text-[#2D2A26]/70 hover:text-[#7B9B88] bg-[#E8F0EC] hover:bg-[#D5E4DC] rounded-full transition-colors cursor-pointer"
              title="Close Full View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#7B9B88] text-white px-6 py-3 rounded-full text-xs font-montserrat font-bold shadow-2xl border border-[#688875] flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Full Page Body */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28 lg:pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* Gallery Section */}
            <div className="space-y-4">
              <div className="relative w-full h-[320px] sm:h-[460px] lg:h-[600px] bg-[#E8F0EC]/40 rounded-3xl overflow-hidden border border-[#D5E4DC] shadow-xs">
                <img
                  src={selectedImage || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Thumbnails */}
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-18 h-22 sm:w-24 sm:h-28 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                      (selectedImage === img || (!selectedImage && idx === 0))
                        ? 'border-[#7B9B88] ring-2 ring-[#7B9B88]/20 scale-105 shadow-md'
                        : 'border-[#D5E4DC] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>

            {/* Content Info Section */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs font-montserrat uppercase tracking-wider text-[#7B9B88]">
                  <span className="bg-[#E8F0EC] px-3 py-1 rounded-full text-[#2D2A26] font-bold border border-[#D5E4DC]">
                    {product.categoryName}
                  </span>
                  <div className="flex items-center space-x-1 text-[#4E6E5D] font-bold">
                    <Star className="w-4 h-4 fill-[#E8DCB8] text-[#7B9B88]" />
                    <span>{product.rating} ({product.reviewCount} Reviews)</span>
                  </div>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2A26] mt-3 leading-tight">
                  {product.name}
                </h1>
                
                <p className="text-sm font-sans text-[#7B9B88] mt-1 font-medium">
                  {product.subtitle || product.fabric}
                </p>

                {/* Price Display */}
                <div className="mt-4 flex items-baseline space-x-3">
                  <span className="font-serif text-3xl font-bold text-[#2D2A26]">{price}</span>
                  {originalPrice && (
                    <span className="text-base text-[#8C7A6B] line-through font-sans">{originalPrice}</span>
                  )}
                  <span className="text-xs font-montserrat font-bold bg-[#7B9B88] text-white px-2.5 py-0.5 rounded-full">
                    
                  </span>
                </div>

                {/* Offer Notification Banner */}
                <div className="mt-4 bg-[#E8F0EC] border border-[#D5E4DC] p-3 rounded-xl flex items-center gap-2 text-xs font-sans text-[#2D2A26]">
                  <span>Eligible for <strong>15% OFF</strong> with promo code <strong className="underline cursor-pointer text-[#7B9B88]">EUROPE15</strong> at checkout.</span>
                </div>

                {/* Color Selector */}
                <div className="mt-6">
                  <label className="text-xs font-montserrat uppercase tracking-wider font-bold text-[#2D2A26] block mb-2">
                    Select Color Shade: <span className="font-normal text-[#2D2A26]">{selectedColor}</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {product.colors.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(color.name)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-sans transition-all cursor-pointer ${
                          selectedColor === color.name
                            ? 'border-[#7B9B88] bg-[#7B9B88] text-white font-semibold shadow-xs'
                            : 'border-[#D5E4DC] bg-white text-[#2D2A26] hover:bg-[#E8F0EC]'
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
                    <label className="text-xs font-montserrat uppercase tracking-wider font-bold text-[#2D2A26]">
                      Select Size: <span className="font-normal text-[#2D2A26]">{selectedSize}</span>
                    </label>
                    <button
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="text-xs text-[#7B9B88] hover:underline flex items-center gap-1 font-montserrat font-semibold cursor-pointer"
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
                        className={`min-w-[48px] py-2 px-3 rounded-xl text-xs font-montserrat font-bold border transition-all cursor-pointer ${
                          selectedSize === size
                            ? 'bg-[#7B9B88] text-white border-[#7B9B88] shadow-md'
                            : 'bg-white text-[#2D2A26] border-[#D5E4DC] hover:border-[#7B9B88]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="mt-6 flex items-center space-x-4">
                  <label className="text-xs font-montserrat uppercase tracking-wider font-bold text-[#2D2A26]">
                    Quantity:
                  </label>
                  <div className="flex items-center border border-[#D5E4DC] rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-lg font-bold text-[#7B9B88] hover:bg-[#E8F0EC] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-montserrat font-bold text-[#2D2A26]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-1.5 text-lg font-bold text-[#7B9B88] hover:bg-[#E8F0EC] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* In-Line Action CTAs */}
              <div className="pt-6 border-t border-[#EAE2D7] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className={`py-4 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-xs ${
                      isAddedToCart
                        ? 'bg-emerald-700 text-white border-2 border-emerald-600'
                        : 'bg-[#E8F0EC] hover:bg-[#D5E4DC] text-[#2D2A26]'
                    }`}
                  >
                    {isAddedToCart ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-200" />
                        <span>Item Added to Cart ✓</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-[#7B9B88]" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="bg-[#7B9B88] hover:bg-[#688875] text-white py-4 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>Buy Now ({price})</span>
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
                    
                    window.open(`https://wa.me/919891179374?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3.5 rounded-2xl font-montserrat text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Enquire / Custom Order via WhatsApp</span>
                </button>
              </div>

              {/* Tabs Info Section */}
              <div className="pt-2">
                <div className="flex border-b border-[#EAE2D7] space-x-4 text-xs font-montserrat uppercase tracking-wider font-bold">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-2 transition-colors border-b-2 cursor-pointer ${
                      activeTab === 'details' ? 'border-[#7B9B88] text-[#7B9B88]' : 'text-[#8C7A6B] border-transparent'
                    }`}
                  >
                    Garment Story
                  </button>
                  <button
                    onClick={() => setActiveTab('fabric')}
                    className={`pb-2 transition-colors border-b-2 cursor-pointer ${
                      activeTab === 'fabric' ? 'border-[#7B9B88] text-[#7B9B88]' : 'text-[#8C7A6B] border-transparent'
                    }`}
                  >
                    Fabric & GSM
                  </button>
                  <button
                    onClick={() => setActiveTab('origin')}
                    className={`pb-2 transition-colors border-b-2 cursor-pointer ${
                      activeTab === 'origin' ? 'border-[#7B9B88] text-[#7B9B88]' : 'text-[#8C7A6B] border-transparent'
                    }`}
                  >
                    Ethical Origin
                  </button>
                  <button
                    onClick={() => setActiveTab('shipping')}
                    className={`pb-2 transition-colors border-b-2 cursor-pointer ${
                      activeTab === 'shipping' ? 'border-[#7B9B88] text-[#7B9B88]' : 'text-[#8C7A6B] border-transparent'
                    }`}
                  >
                    Export Shipping
                  </button>
                </div>

                <div className="py-3 text-xs font-sans text-[#2D2A26]/80 leading-relaxed min-h-[80px]">
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
                      <div className="flex items-center gap-1.5 text-[#7B9B88] font-semibold">
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
        </main>



      </div>

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </>
  );
};
