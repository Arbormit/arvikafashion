import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { WishlistItem, Currency, Product } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: WishlistItem[];
  currency: Currency;
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product, color: string, size: string) => void;
  onQuickView: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlist,
  currency,
  onRemoveFromWishlist,
  onAddToCart,
  onQuickView
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F4] border-l border-[#EFE6D8] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 bg-[#214C3A] text-[#FAF8F4] flex items-center justify-between border-b border-[#4A5D4E]">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-[#D8C6A5] fill-[#D8C6A5]" />
              <h2 className="font-serif text-2xl font-bold tracking-wide">Saved Wishlist</h2>
              <span className="bg-[#1A3D2F] text-[#D8C6A5] text-xs px-2.5 py-0.5 rounded-full font-montserrat font-bold">
                {wishlist.length} Items
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-[#FAF8F4]/80 hover:text-white rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-[#EFE6D8]">
            {wishlist.length > 0 ? (
              wishlist.map((item) => {
                const price = currency === 'INR' 
                  ? `₹${item.product.priceINR.toLocaleString('en-IN')}` 
                  : `€${item.product.priceEUR}`;

                return (
                  <div key={item.id} className="pt-4 first:pt-0 flex space-x-4 items-start">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-24 rounded-xl object-cover border border-[#D8C6A5] flex-shrink-0 cursor-pointer"
                      onClick={() => {
                        onQuickView(item.product);
                        onClose();
                      }}
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 
                          onClick={() => {
                            onQuickView(item.product);
                            onClose();
                          }}
                          className="font-serif font-bold text-sm text-[#214C3A] cursor-pointer hover:underline"
                        >
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveFromWishlist(item.product.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Remove item from Wishlist"
                          aria-label="Remove wishlist item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-[#8C7A6B] font-sans">
                        {item.product.categoryName} • {item.product.fabric}
                      </p>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="font-serif font-bold text-base text-[#214C3A]">
                          {price}
                        </span>

                        <button
                          onClick={() => {
                            onAddToCart(item.product, item.product.colors[0]?.name || 'Default', item.product.sizes[0] || 'M');
                            onRemoveFromWishlist(item.product.id);
                          }}
                          className="bg-[#214C3A] text-[#FAF8F4] px-3 py-1.5 rounded-xl text-xs font-montserrat font-bold hover:bg-[#4A5D4E] flex items-center gap-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Move to Cart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 space-y-3">
                <Heart className="w-12 h-12 text-[#D8C6A5] mx-auto" />
                <p className="font-serif text-xl font-bold text-[#214C3A]">
                  Your wishlist is empty
                </p>
                <p className="text-xs text-[#8C7A6B] font-sans">
                  Click the heart icon on any garment to save it for later.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
