import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X, 
  ChevronDown, 
  Tag, 
  Search, 
  Sparkles,
  ArrowRight,
  CheckCircle,
  Globe,
  SlidersHorizontal,
  LogOut,
  PackageCheck
} from 'lucide-react';
import { ActiveTab, Currency, User as UserType, CartItem, WishlistItem } from '../types';
import { CATEGORIES } from '../data/categories';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  cart: CartItem[];
  wishlist: WishlistItem[];
  setIsCartOpen: (open: boolean) => void;
  setIsWishlistOpen: (open: boolean) => void;
  setIsAuthOpen: (open: boolean) => void;
  setIsProfileOpen: (open: boolean) => void;
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  onSearchOpen: () => void;
  onOpenTrackOrder: () => void;
  onOpenAdminDashboard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  currency,
  setCurrency,
  cart,
  wishlist,
  setIsCartOpen,
  setIsWishlistOpen,
  setIsAuthOpen,
  setIsProfileOpen,
  user,
  setUser,
  onSearchOpen,
  onOpenTrackOrder,
  onOpenAdminDashboard
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalINR = cart.reduce((sum, item) => sum + item.product.priceINR * item.quantity, 0);
  const cartTotalEUR = cart.reduce((sum, item) => sum + item.product.priceEUR * item.quantity, 0);

  const handleNavClick = (tab: ActiveTab, categoryId: string | null = null) => {
    setActiveTab(tab);
    if (categoryId) {
      setSelectedCategory(categoryId);
    } else if (tab === 'collections') {
      setSelectedCategory(null);
    }
    setIsMegaMenuOpen(false);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F4]/95 backdrop-blur-md border-b border-[#EFE6D8]">
      {/* Top Announcement Bar */}
      <div className="bg-[#214C3A] text-[#FAF8F4] px-4 py-2 text-xs font-sans flex justify-between items-center tracking-wide">
        <div className="hidden md:flex items-center space-x-4">
          <span className="flex items-center space-x-1.5 text-[#D8C6A5]">
            <Globe className="w-3.5 h-3.5" />
            <span>European & Global Export Headquarters</span>
          </span>
          <span className="text-white/30">|</span>
          <span>GST Registered & OEKO-TEX® Certified Manufacturer</span>
        </div>
        <div className="mx-auto md:mx-0 flex items-center space-x-3">
          <span className="font-medium text-[#FAF8F4] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D8C6A5]" />
            Use Code <strong className="text-[#D8C6A5]">EUROPE15</strong> for 15% OFF First Order
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-3">
          {/* Currency Switcher */}
          <div className="flex items-center bg-[#1A3D2F] rounded-full p-0.5 border border-[#4A5D4E]">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                currency === 'INR' ? 'bg-[#D8C6A5] text-[#214C3A]' : 'text-[#EFE6D8] hover:text-white'
              }`}
            >
              INR (₹)
            </button>
            <button
              onClick={() => setCurrency('EUR')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                currency === 'EUR' ? 'bg-[#D8C6A5] text-[#214C3A]' : 'text-[#EFE6D8] hover:text-white'
              }`}
            >
              EUR (€)
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Emblem */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => handleNavClick('home')}>
            <div className="w-10 h-10 rounded-full bg-[#214C3A] text-[#D8C6A5] flex items-center justify-center font-serif text-xl font-bold tracking-tighter border border-[#C5A059]/40 shadow-sm transition-transform group-hover:scale-105">
              AR
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-[0.15em] text-[#214C3A] uppercase leading-tight">
                ARVIKA
              </span>
              <span className="text-[9px] font-montserrat uppercase tracking-[0.35em] text-[#8C7A6B] -mt-0.5 font-semibold">
                FASHION • EUROPE
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-sans">
            <button
              onClick={() => handleNavClick('home')}
              className={`transition-colors py-1 relative ${
                activeTab === 'home' ? 'text-[#214C3A] font-semibold' : 'text-[#1C1C1C]/80 hover:text-[#214C3A]'
              }`}
            >
              Home
              {activeTab === 'home' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#214C3A] rounded-full animate-fade-in" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className={`transition-colors py-1 relative ${
                activeTab === 'about' ? 'text-[#214C3A] font-semibold' : 'text-[#1C1C1C]/80 hover:text-[#214C3A]'
              }`}
            >
              About Us
              {activeTab === 'about' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#214C3A] rounded-full animate-fade-in" />
              )}
            </button>

            {/* Mega Dropdown trigger for Collections */}
            <div 
              className="relative"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button
                onClick={() => handleNavClick('collections')}
                className={`flex items-center space-x-1 py-1 transition-colors ${
                  activeTab === 'collections' ? 'text-[#214C3A] font-semibold' : 'text-[#1C1C1C]/80 hover:text-[#214C3A]'
                }`}
              >
                <span>Collections</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                {activeTab === 'collections' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#214C3A] rounded-full animate-fade-in" />
                )}
              </button>

              {/* Mega Dropdown Menu */}
              {isMegaMenuOpen && (
                <div className="absolute top-full -left-20 w-[840px] bg-[#FAF8F4] border border-[#EFE6D8] shadow-xl rounded-xl p-6 mt-1 z-50 grid grid-cols-3 gap-6 animate-fade-in">
                  <div className="col-span-2 grid grid-cols-2 gap-3">
                    <div className="col-span-2 text-xs font-montserrat uppercase tracking-widest text-[#8C7A6B] font-semibold border-b border-[#EFE6D8] pb-2 mb-1">
                      8 Premium Product Categories
                    </div>
                    {CATEGORIES.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => handleNavClick('collections', cat.id)}
                        className={`p-2.5 rounded-lg transition-all cursor-pointer flex items-center space-x-3 group hover:bg-[#EFE6D8]/60 ${
                          selectedCategory === cat.id ? 'bg-[#EFE6D8]' : ''
                        }`}
                      >
                        <img 
                          src={cat.image} 
                          alt={cat.name} 
                          className="w-12 h-12 rounded-md object-cover border border-[#D8C6A5]"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-serif font-semibold text-sm text-[#214C3A] group-hover:text-[#4A5D4E]">
                            {cat.name}
                          </div>
                          <div className="text-[11px] text-[#8C7A6B] line-clamp-1 font-sans">
                            {cat.tagline}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mega Dropdown Featured Highlight */}
                  <div className="bg-[#214C3A] text-[#FAF8F4] rounded-lg p-5 flex flex-col justify-between border border-[#4A5D4E]">
                    <div>
                      <span className="text-[10px] font-montserrat uppercase tracking-widest text-[#D8C6A5] bg-[#1A3D2F] px-2.5 py-1 rounded-full border border-[#D8C6A5]/30">
                        Export Highlight
                      </span>
                      <h4 className="font-serif text-xl font-bold mt-3 text-[#FAF8F4] leading-tight">
                        Pure Normandy Linen Couture
                      </h4>
                      <p className="text-xs text-[#FAF8F4]/80 mt-2 font-sans leading-relaxed">
                        Ethically woven, pre-washed for vintage softness, tailored with French seams.
                      </p>
                    </div>
                    <button
                      onClick={() => handleNavClick('collections', 'pure-linen')}
                      className="mt-4 bg-[#D8C6A5] text-[#214C3A] px-4 py-2 rounded-md text-xs font-montserrat font-bold hover:bg-[#FAF8F4] transition-colors flex items-center justify-between"
                    >
                      <span>Explore Pure Linen</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('reviews')}
              className={`transition-colors py-1 relative ${
                activeTab === 'reviews' ? 'text-[#214C3A] font-semibold' : 'text-[#1C1C1C]/80 hover:text-[#214C3A]'
              }`}
            >
              Reviews
              {activeTab === 'reviews' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#214C3A] rounded-full animate-fade-in" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('offers')}
              className={`flex items-center space-x-1.5 py-1 transition-colors relative ${
                activeTab === 'offers' ? 'text-[#214C3A] font-semibold' : 'text-[#1C1C1C]/80 hover:text-[#214C3A]'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Offers</span>
              <span className="bg-[#214C3A] text-[#D8C6A5] text-[10px] font-montserrat px-1.5 py-0.5 rounded-full font-bold ml-0.5">
                4 Active
              </span>
              {activeTab === 'offers' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#214C3A] rounded-full animate-fade-in" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('buynow')}
              className="bg-[#214C3A] text-[#FAF8F4] px-4 py-2 rounded-full text-xs font-montserrat font-semibold hover:bg-[#4A5D4E] transition-all shadow-sm flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D8C6A5]" />
              <span>Buy Now</span>
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4">
            
            {/* Track Order Button */}
            <button
              onClick={onOpenTrackOrder}
              className="p-2 text-[#1C1C1C]/80 hover:text-[#214C3A] transition-colors rounded-full hover:bg-[#EFE6D8]/50 flex items-center space-x-1"
              title="Track Order"
            >
              <PackageCheck className="w-5 h-5 text-[#214C3A]" />
              <span className="hidden xl:inline text-xs font-montserrat font-bold text-[#214C3A]">Track Order</span>
            </button>

            {/* Admin Console Trigger Button */}
            <button
              onClick={onOpenAdminDashboard}
              className={`p-2 transition-colors rounded-full flex items-center space-x-1 ${
                user.role === 'admin' ? 'bg-[#C5A059] text-white' : 'hover:bg-[#EFE6D8]/50 text-[#8C7A6B]'
              }`}
              title="HQ Admin Dashboard"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden xl:inline text-[11px] font-montserrat font-bold">
                {user.role === 'admin' ? 'HQ Admin' : 'Admin'}
              </span>
            </button>

            {/* Search Trigger */}
            <button
              onClick={onSearchOpen}
              className="p-2 text-[#1C1C1C]/80 hover:text-[#214C3A] transition-colors rounded-full hover:bg-[#EFE6D8]/50"
              title="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="p-2 text-[#1C1C1C]/80 hover:text-[#214C3A] transition-colors relative rounded-full hover:bg-[#EFE6D8]/50"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-[#214C3A] text-[#FAF8F4] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-montserrat">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-[#214C3A] hover:text-[#4A5D4E] transition-colors relative flex items-center space-x-2 bg-[#EFE6D8]/70 hover:bg-[#EFE6D8] px-3 py-1.5 rounded-full border border-[#D8C6A5]/50"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-[#214C3A]" />
              <span className="font-montserrat font-bold text-xs text-[#214C3A]">
                {currency === 'INR' ? `₹${cartTotalINR.toLocaleString('en-IN')}` : `€${cartTotalEUR}`}
              </span>
              {cartCount > 0 && (
                <span className="bg-[#214C3A] text-[#D8C6A5] text-[10px] font-bold px-1.5 py-0.5 rounded-full font-montserrat">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth / Profile Button */}
            {user.isLoggedIn ? (
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center space-x-2 bg-[#214C3A] text-[#FAF8F4] px-3 py-1.5 rounded-full text-xs font-montserrat font-semibold hover:bg-[#4A5D4E] transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-[#D8C6A5] text-[#214C3A] flex items-center justify-center font-bold text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline line-clamp-1">{user.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center space-x-1.5 text-xs font-montserrat font-semibold text-[#214C3A] border border-[#214C3A] px-3 py-1.5 rounded-full hover:bg-[#214C3A] hover:text-[#FAF8F4] transition-all"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#1C1C1C] hover:text-[#214C3A]"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF8F4] border-b border-[#EFE6D8] px-4 pt-2 pb-6 space-y-3 animate-fade-in shadow-lg">
          <div className="flex justify-between items-center py-2 border-b border-[#EFE6D8]">
            <span className="text-xs font-montserrat uppercase tracking-wider text-[#8C7A6B]">Currency Selection</span>
            <div className="flex items-center space-x-1 bg-[#EFE6D8] rounded-full p-1">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  currency === 'INR' ? 'bg-[#214C3A] text-[#FAF8F4]' : 'text-[#1C1C1C]'
                }`}
              >
                INR (₹)
              </button>
              <button
                onClick={() => setCurrency('EUR')}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  currency === 'EUR' ? 'bg-[#214C3A] text-[#FAF8F4]' : 'text-[#1C1C1C]'
                }`}
              >
                EUR (€)
              </button>
            </div>
          </div>

          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left py-2 font-serif text-lg font-semibold border-b border-[#EFE6D8] ${
              activeTab === 'home' ? 'text-[#214C3A]' : 'text-[#1C1C1C]'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => handleNavClick('about')}
            className={`w-full text-left py-2 font-serif text-lg font-semibold border-b border-[#EFE6D8] ${
              activeTab === 'about' ? 'text-[#214C3A]' : 'text-[#1C1C1C]'
            }`}
          >
            About Us & Export Mastery
          </button>

          <div>
            <div className="font-serif text-lg font-semibold py-2 text-[#214C3A] flex justify-between items-center">
              <span>Collections</span>
              <span className="text-xs font-sans text-[#8C7A6B]">8 Categories</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pl-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleNavClick('collections', cat.id)}
                  className="text-left py-1.5 px-2 rounded-md bg-[#EFE6D8]/50 text-xs font-sans text-[#214C3A] line-clamp-1"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleNavClick('reviews')}
            className={`w-full text-left py-2 font-serif text-lg font-semibold border-b border-[#EFE6D8] ${
              activeTab === 'reviews' ? 'text-[#214C3A]' : 'text-[#1C1C1C]'
            }`}
          >
            Client Reviews & Ratings
          </button>

          <button
            onClick={() => handleNavClick('offers')}
            className={`w-full text-left py-2 font-serif text-lg font-semibold border-b border-[#EFE6D8] flex items-center justify-between ${
              activeTab === 'offers' ? 'text-[#214C3A]' : 'text-[#1C1C1C]'
            }`}
          >
            <span>Offers & Discounts</span>
            <span className="bg-[#214C3A] text-[#D8C6A5] text-xs px-2 py-0.5 rounded-full font-montserrat font-bold">
              4 Active
            </span>
          </button>

          <button
            onClick={() => handleNavClick('buynow')}
            className="w-full bg-[#214C3A] text-[#FAF8F4] py-3 rounded-lg text-sm font-montserrat font-bold mt-2 flex items-center justify-center space-x-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-[#D8C6A5]" />
            <span>Buy Now / Fast Checkout</span>
          </button>
        </div>
      )}
    </header>
  );
};
