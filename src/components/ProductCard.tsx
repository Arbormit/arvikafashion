import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Check } from 'lucide-react';
import { Product, Currency, CartItem, WishlistItem } from '../types';

interface ProductCardProps {
  product: Product;
  currency: Currency;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, color: string, size: string) => void;
  onBuyNow: (product: Product, color: string, size: string) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  isInCart?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  onQuickView,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  isInCart = false
}) => {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Natural');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const price = currency === 'INR' 
    ? `₹${product.priceINR.toLocaleString('en-IN')}` 
    : `€${product.priceEUR}`;

  const originalPrice = product.originalPriceINR && product.originalPriceEUR
    ? currency === 'INR'
      ? `₹${product.originalPriceINR.toLocaleString('en-IN')}`
      : `€${product.originalPriceEUR}`
    : null;

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedColor, selectedSize);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBuyNow(product, selectedColor, selectedSize);
  };

  return (
    <div 
      className="group relative bg-[#FAF8F4] border border-[#EFE6D8] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
      onMouseEnter={() => {
        setIsHovered(true);
        if (product.images.length > 1) setCurrentImageIndex(1);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
    >
      {/* Product Image Box */}
      <div 
        className="relative aspect-[3/4] w-full bg-[#EFE6D8]/40 overflow-hidden cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <img
          src={product.images[currentImageIndex] || product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isTrending && (
            <span className="bg-[#7B9B88] text-white text-[10px] font-montserrat font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
              Trending
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-[#E8DCB8] text-[#2D2A26] text-[10px] font-montserrat font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs border border-[#DCD3C5]">
              Best Seller
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-200 z-10 ${
            isWishlisted 
              ? 'bg-[#7B9B88] text-white shadow-md scale-110' 
              : 'bg-white/90 hover:bg-white text-[#2D2A26] hover:text-[#7B9B88] backdrop-blur-sm border border-[#EAE2D7]'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white text-white' : ''}`} />
        </button>

        {/* Hover Quick Actions */}
        <div className={`absolute inset-x-3 bottom-3 flex items-center gap-2 transition-all duration-300 z-10 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          <button
            onClick={() => onQuickView(product)}
            className="flex-1 bg-white/95 hover:bg-[#FAF8F4] text-[#2D2A26] py-2.5 rounded-xl font-montserrat text-xs font-bold transition-colors shadow-md border border-[#EAE2D7] flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-[#7B9B88]" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Fabric Category Subtitle */}
          <div className="text-[11px] font-montserrat uppercase tracking-wider text-[#7B9B88] font-semibold flex items-center justify-between">
            <span>{product.categoryName}</span>
            <span className="text-[#4E6E5D] font-bold">★ {product.rating}</span>
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => onQuickView(product)}
            className="font-serif text-lg font-bold text-[#2D2A26] mt-1 hover:text-[#7B9B88] cursor-pointer transition-colors leading-snug line-clamp-1"
          >
            {product.name}
          </h3>

          <p className="text-xs text-[#2D2A26]/70 font-sans line-clamp-1 mt-0.5">
            {product.subtitle || product.fabric}
          </p>

          {/* Color Swatches */}
          <div className="flex items-center gap-1.5 mt-3">
            {product.colors.map((color, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedColor(color.name)}
                className={`w-4 h-4 rounded-full border transition-all ${
                  selectedColor === color.name 
                    ? 'ring-2 ring-[#7B9B88] ring-offset-1 scale-110' 
                    : 'border-black/20 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            <span className="text-[10px] text-[#8C7A6B] font-sans ml-1">
              {product.colors.length} shades
            </span>
          </div>

          {/* Sizes Selection Pills */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {product.sizes.slice(0, 5).map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`text-[10px] font-montserrat font-semibold px-2 py-0.5 rounded border transition-colors ${
                  selectedSize === size
                    ? 'bg-[#7B9B88] text-white border-[#7B9B88]'
                    : 'bg-[#E8F0EC]/60 text-[#2D2A26] border-[#D5E4DC] hover:border-[#7B9B88]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-4 mt-3 border-t border-[#EAE2D7] flex items-center justify-between">
          <div>
            <div className="font-serif font-bold text-xl text-[#2D2A26]">
              {price}
            </div>
            {originalPrice && (
              <div className="text-xs text-[#8C7A6B] line-through">
                {originalPrice}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAddToCartClick}
              className={`p-2.5 rounded-xl transition-all font-montserrat text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                isInCart || addedToast
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-[#E8F0EC] hover:bg-[#D5E4DC] text-[#2D2A26]'
              }`}
              title={isInCart ? 'Item Added to Cart ✓' : 'Add to Cart'}
            >
              {isInCart || addedToast ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span className="text-[10px] font-bold">Added</span>
                </>
              ) : (
                <ShoppingBag className="w-4 h-4 text-[#7B9B88]" />
              )}
            </button>
            
            <button
              onClick={handleBuyNowClick}
              className="bg-[#7B9B88] hover:bg-[#688875] text-white px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold transition-all shadow-xs cursor-pointer"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
