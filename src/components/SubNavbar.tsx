import React from 'react';
import { 
  Sparkles, 
  PackageCheck, 
  Heart, 
  ShoppingBag, 
  ShieldAlert, 
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { Currency, User, CartItem, WishlistItem, ActiveTab } from '../types';

interface SubNavbarProps {
  user: User;
  currency: Currency;
  cart: CartItem[];
  wishlist: WishlistItem[];
  onNavigateBuyNow: () => void;
  onOpenTrackOrder: () => void;
  onOpenWishlist: () => void;
  onOpenCart: () => void;
  onOpenAdminPanel: () => void;
}

export const SubNavbar: React.FC<SubNavbarProps> = ({
  user,
  currency,
  cart,
  wishlist,
  onNavigateBuyNow,
  onOpenTrackOrder,
  onOpenWishlist,
  onOpenCart,
  onOpenAdminPanel,
}) => {
  // Only render if user is logged in
  if (!user || !user.isLoggedIn) {
    return null;
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalINR = cart.reduce((sum, item) => sum + item.product.priceINR * item.quantity, 0);
  const cartTotalEUR = cart.reduce((sum, item) => sum + item.product.priceEUR * item.quantity, 0);

  const isAdmin = user.role === 'admin';

  return (
    <div className="w-full bg-[#1A3D2F] text-[#FAF8F4] border-b border-[#2D5A46] shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 text-xs font-sans">
          
          {/* Left Welcome Pill / Indicator */}
          <div className="hidden md:flex items-center space-x-2 text-[#D8C6A5]">
            <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
            <span className="font-montserrat text-[11px] font-semibold uppercase tracking-wider">
              {isAdmin ? 'Admin Workspace' : 'Client Dashboard Active'}
            </span>
          </div>

          {/* Center / Main Sub-Nav Items */}
          <nav className="w-full md:w-auto flex items-center justify-between md:justify-end space-x-1 sm:space-x-3 overflow-x-auto py-1 scrollbar-none">
            
            {/* 1. Buy Now */}
            <button
              onClick={onNavigateBuyNow}
              className="flex items-center space-x-1.5 bg-[#D8C6A5] text-[#214C3A] hover:bg-[#FAF8F4] px-3 py-1.5 rounded-full font-montserrat font-bold text-[11px] transition-all shrink-0 shadow-sm"
              title="Fast Catalog & Quick Checkout"
            >
              <span>Buy Now</span>
            </button>

            {/* 2. Track Order */}
            <button
              onClick={onOpenTrackOrder}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full hover:bg-[#214C3A] text-[#FAF8F4]/90 hover:text-white transition-all font-montserrat text-[11px] font-semibold shrink-0"
              title="Track Active Express Orders"
            >
              <PackageCheck className="w-3.5 h-3.5 text-[#D8C6A5]" />
              <span>Track Order</span>
            </button>

            {/* 3. Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full hover:bg-[#214C3A] text-[#FAF8F4]/90 hover:text-white transition-all font-montserrat text-[11px] font-semibold shrink-0 relative"
              title="Saved Items"
            >
              <Heart className="w-3.5 h-3.5 text-[#EFE6D8]" />
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span className="bg-[#C5A059] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-montserrat min-w-4 text-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* 4. My Cart */}
            <button
              onClick={onOpenCart}
              className="flex items-center space-x-1.5 bg-[#214C3A] hover:bg-[#2D5A46] border border-[#4A5D4E] px-3 py-1.5 rounded-full text-[#FAF8F4] transition-all font-montserrat font-bold text-[11px] shrink-0"
              title="View Shopping Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#D8C6A5]" />
              <span>My Cart</span>
              <span className="text-[#D8C6A5] font-semibold ml-0.5">
                ({currency === 'INR' ? `₹${cartTotalINR.toLocaleString('en-IN')}` : `€${cartTotalEUR}`})
              </span>
              {cartCount > 0 && (
                <span className="bg-[#C5A059] text-[#214C3A] text-[10px] font-bold px-1.5 py-0.2 rounded-full font-montserrat">
                  {cartCount}
                </span>
              )}
            </button>

            {/* 5. Admin Panel (STRICT RBAC: Visible ONLY to Authorised Admin Users) */}
            {isAdmin && (
              <button
                onClick={onOpenAdminPanel}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-[#C5A059] to-[#D8C6A5] text-[#214C3A] hover:opacity-95 px-3 py-1.5 rounded-full font-montserrat font-bold text-[11px] transition-all shrink-0 shadow-md border border-[#FAF8F4]/30 animate-pulse"
                title="HQ Admin Control Console"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            )}

          </nav>
        </div>
      </div>
    </div>
  );
};
