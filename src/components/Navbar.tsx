import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
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
  Globe,
  SlidersHorizontal,
  PackageCheck,
  LogOut,
  ShieldCheck,
  Languages,
  Code
} from 'lucide-react';
import { ActiveTab, Currency, Language, User as UserType, CartItem, WishlistItem } from '../types';
import { CATEGORIES } from '../data/categories';
import { TOP_EUROPEAN_LANGUAGES, TRANSLATIONS, applyLanguageTranslation } from '../data/translations';
import { SubNavbar } from './SubNavbar';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
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
  language,
  setLanguage,
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
  const [isMobileCollectionsOpen, setIsMobileCollectionsOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<string[]>(() => db.getAnnouncements());

  useEffect(() => {
    const handleAnnouncementsUpdate = () => {
      setAnnouncements(db.getAnnouncements());
    };
    window.addEventListener('arvika_announcements_updated', handleAnnouncementsUpdate);
    return () => window.removeEventListener('arvika_announcements_updated', handleAnnouncementsUpdate);
  }, []);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
    <header className="sticky top-0 z-40 bg-[#FAF8F4]/95 backdrop-blur-md border-b border-[#EAE2D7] shadow-xs">
      {/* Top Announcement Bar - Desktop Layout */}
      <div className="bg-[#E8F0EC] text-[#2D2A26] px-4 py-1.5 text-xs font-sans hidden md:flex justify-between items-center tracking-wide border-b border-[#D5E4DC]">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5 text-[#6B8E7B] font-medium">
            <Globe className="w-3.5 h-3.5 text-[#7B9B88]" />
            <span>Head Office H23, G4 Krishna Nagar, Faridabad, near Krishna Public School - 121003</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="font-medium text-[#2D2A26] flex items-center gap-1.5 text-xs">
            <Tag className="w-3.5 h-3.5 text-[#7B9B88]" />
            <strong className="text-[#4E6E5D] font-bold">{announcements[0] || 'Use Code EUROPE15 for 15% OFF'}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* European Language Translator Dropdown */}
          <div className="relative group">
            <div className="flex items-center bg-[#FAF8F4] text-[#2D2A26] rounded-full px-3 py-1 border border-[#D5E4DC] cursor-pointer hover:border-[#7B9B88] transition-all text-[11px] font-montserrat font-bold space-x-1.5 shadow-xs">
              <Languages className="w-3.5 h-3.5 text-[#7B9B88]" />
              <span className="text-[#6B8E7B]">
                {TOP_EUROPEAN_LANGUAGES.find((l) => l.code === language)?.flag}
              </span>
              <span className="uppercase tracking-wider text-[#2D2A26]">
                {TOP_EUROPEAN_LANGUAGES.find((l) => l.code === language)?.code}
              </span>
              <span className="text-[10px] text-[#2D2A26]/70 font-normal">
                ({TOP_EUROPEAN_LANGUAGES.find((l) => l.code === language)?.nativeName})
              </span>
              <ChevronDown className="w-3 h-3 text-[#7B9B88] transition-transform group-hover:rotate-180" />
            </div>

            {/* Dropdown Options for Top 5 European Languages */}
            <div className="absolute right-0 top-full mt-1 w-44 bg-[#FAF8F4] border border-[#D5E4DC] rounded-xl shadow-xl p-1.5 hidden group-hover:block z-50 animate-fade-in space-y-0.5">
              <div className="text-[9px] font-montserrat uppercase tracking-wider text-[#6B8E7B] px-2.5 py-1 font-bold border-b border-[#E8F0EC] mb-1">
                Top 5 European Languages
              </div>
              {TOP_EUROPEAN_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    applyLanguageTranslation(lang.code);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-montserrat flex items-center justify-between transition-colors ${
                    language === lang.code
                      ? 'bg-[#7B9B88] text-white font-bold'
                      : 'text-[#2D2A26] hover:bg-[#E8F0EC]'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </span>
                  <span className="text-[9px] font-mono opacity-80 uppercase">{lang.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Announcement Bar - Mobile & Tablet Slow Marquee Loop */}
      <div className="bg-[#E8F0EC] text-[#2D2A26] py-1.5 text-[11px] font-sans overflow-hidden block md:hidden border-b border-[#D5E4DC]">
        <div className="animate-marquee-slow flex items-center space-x-8 tracking-wide">
          
          {/* Loop Set 1 */}
          {announcements.map((item, idx) => (
            <React.Fragment key={`anc1-${idx}`}>
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#7B9B88]" />
                <span className="font-semibold text-[#4E6E5D]">{item}</span>
              </span>
              <span className="text-[#6B8E7B]/40">•</span>
            </React.Fragment>
          ))}

          {/* Loop Set 2 (Seamless Infinite Scroll Duplicate) */}
          {announcements.map((item, idx) => (
            <React.Fragment key={`anc2-${idx}`}>
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#7B9B88]" />
                <span className="font-semibold text-[#4E6E5D]">{item}</span>
              </span>
              <span className="text-[#6B8E7B]/40">•</span>
            </React.Fragment>
          ))}

        </div>
      </div>

      {/* Primary Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* 1. Logo & Emblem */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => handleNavClick('home')}>
            <div className="w-10 h-10 rounded-full bg-[#7B9B88] text-white flex items-center justify-center font-serif text-xl font-bold tracking-tighter border border-[#E8DCB8]/60 shadow-xs transition-transform group-hover:scale-105">
              AR
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-[0.15em] text-[#2D2A26] uppercase leading-tight">
                ARVIKA
              </span>
              <span className="text-[9px] font-montserrat uppercase tracking-[0.35em] text-[#7B9B88] -mt-0.5 font-semibold">
                FASHION
              </span>
            </div>
          </div>

          {/* Desktop Primary Nav Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-sans font-medium">
            
            {/* 2. Home */}
            <button
              onClick={() => handleNavClick('home')}
              className={`transition-colors py-1 relative ${
                activeTab === 'home' ? 'text-[#7B9B88] font-bold' : 'text-[#2D2A26]/80 hover:text-[#7B9B88]'
              }`}
            >
              {t.home}
              {activeTab === 'home' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7B9B88] rounded-full animate-fade-in" />
              )}
            </button>

            {/* 3. About Us */}
            <button
              onClick={() => handleNavClick('about')}
              className={`transition-colors py-1 relative ${
                activeTab === 'about' ? 'text-[#7B9B88] font-bold' : 'text-[#2D2A26]/80 hover:text-[#7B9B88]'
              }`}
            >
              {t.aboutUs}
              {activeTab === 'about' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7B9B88] rounded-full animate-fade-in" />
              )}
            </button>

            {/* 4. Collections (Mega Dropdown Trigger) */}
            <div 
              className="relative"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button
                onClick={() => handleNavClick('collections')}
                className={`flex items-center space-x-1 py-1 transition-colors ${
                  activeTab === 'collections' ? 'text-[#7B9B88] font-bold' : 'text-[#2D2A26]/80 hover:text-[#7B9B88]'
                }`}
              >
                <span>{t.collections}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                {activeTab === 'collections' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7B9B88] rounded-full animate-fade-in" />
                )}
              </button>

              {/* Mega Dropdown Menu */}
              {isMegaMenuOpen && (
                <div className="absolute top-full -left-20 w-[840px] bg-[#FAF8F4] border border-[#EAE2D7] shadow-xl rounded-2xl p-6 mt-1 z-50 grid grid-cols-3 gap-6 animate-fade-in">
                  <div className="col-span-2 grid grid-cols-2 gap-3">
                    <div className="col-span-2 text-xs font-montserrat uppercase tracking-widest text-[#7B9B88] font-semibold border-b border-[#EAE2D7] pb-2 mb-1">
                      8 Premium Product Categories
                    </div>
                    {CATEGORIES.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => handleNavClick('collections', cat.id)}
                        className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center space-x-3 group hover:bg-[#E8F0EC]/60 ${
                          selectedCategory === cat.id ? 'bg-[#E8F0EC]' : ''
                        }`}
                      >
                        <img 
                          src={cat.image} 
                          alt={cat.name} 
                          className="w-12 h-12 rounded-lg object-cover border border-[#E8DCB8]"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-serif font-semibold text-sm text-[#2D2A26] group-hover:text-[#7B9B88]">
                            {cat.name}
                          </div>
                          <div className="text-[11px] text-[#7B9B88] line-clamp-1 font-sans">
                            {cat.tagline}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mega Dropdown Featured Highlight */}
                  <div className="bg-[#E8F0EC] text-[#2D2A26] rounded-xl p-5 flex flex-col justify-between border border-[#D5E4DC]">
                    <div>
                      <span className="text-[10px] font-montserrat uppercase tracking-widest text-[#4E6E5D] bg-[#FAF8F4] px-2.5 py-1 rounded-full border border-[#7B9B88]/30 font-bold">
                        Export Highlight
                      </span>
                      <h4 className="font-serif text-xl font-bold mt-3 text-[#2D2A26] leading-tight">
                        Pure Normandy Linen Couture
                      </h4>
                      <p className="text-xs text-[#2D2A26]/80 mt-2 font-sans leading-relaxed">
                        Ethically woven, pre-washed for vintage softness, tailored with French seams.
                      </p>
                    </div>
                    <button
                      onClick={() => handleNavClick('collections', 'pure-linen')}
                      className="mt-4 bg-[#7B9B88] text-white px-4 py-2 rounded-lg text-xs font-montserrat font-bold hover:bg-[#688875] transition-colors flex items-center justify-between"
                    >
                      <span>Explore Pure Linen</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Reviews */}
            <button
              onClick={() => handleNavClick('reviews')}
              className={`transition-colors py-1 relative ${
                activeTab === 'reviews' ? 'text-[#7B9B88] font-bold' : 'text-[#2D2A26]/80 hover:text-[#7B9B88]'
              }`}
            >
              {t.reviews}
              {activeTab === 'reviews' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7B9B88] rounded-full animate-fade-in" />
              )}
            </button>

            {/* 6. Offers */}
            <button
              onClick={() => handleNavClick('offers')}
              className={`flex items-center space-x-1.5 py-1 transition-colors relative ${
                activeTab === 'offers' ? 'text-[#7B9B88] font-bold' : 'text-[#2D2A26]/80 hover:text-[#7B9B88]'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-[#7B9B88]" />
              <span>{t.offers}</span>
              <span className="bg-[#7B9B88] text-white text-[10px] font-montserrat px-1.5 py-0.5 rounded-full font-bold ml-0.5">
                4 Active
              </span>
              {activeTab === 'offers' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7B9B88] rounded-full animate-fade-in" />
              )}
            </button>

            {/* 7. Contact Us */}
            <button
              onClick={() => handleNavClick('contact')}
              className={`transition-colors py-1 relative ${
                activeTab === 'contact' ? 'text-[#7B9B88] font-bold' : 'text-[#2D2A26]/80 hover:text-[#7B9B88]'
              }`}
            >
              <span>Contact Us</span>
              {activeTab === 'contact' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7B9B88] rounded-full animate-fade-in" />
              )}
            </button>

          </nav>

          {/* Right Section: Search & Auth / Profile Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Search Trigger */}
            <button
              onClick={onSearchOpen}
              className="p-2 text-[#7B9B88] hover:text-[#688875] transition-colors rounded-full hover:bg-[#E8F0EC]/60"
              title="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Desktop Auth / Profile Button (lg screen) */}
            <div className="hidden lg:flex items-center">
              {user.isLoggedIn ? (
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center space-x-2 bg-[#7B9B88] text-white px-3.5 py-1.5 rounded-full text-xs font-montserrat font-semibold hover:bg-[#688875] transition-all shadow-xs border border-[#7B9B88]"
                  title="Manage Profile & Addresses"
                >
                  <div className="w-5 h-5 rounded-full bg-[#E8DCB8] text-[#2D2A26] flex items-center justify-center font-bold text-[10px]">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name ? user.name.split(' ')[0] : 'Profile'}</span>
                  {user.role === 'admin' && (
                    <span className="bg-[#E8DCB8] text-[#2D2A26] text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                      Admin
                    </span>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center space-x-1.5 text-xs font-montserrat font-bold text-[#7B9B88] border-2 border-[#7B9B88] px-4 py-1.5 rounded-full hover:bg-[#7B9B88] hover:text-white transition-all shadow-xs cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Login / Signup</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#7B9B88] hover:bg-[#E8F0EC]/60 rounded-full transition-colors"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* SUB-NAVBAR Component (Displayed ONLY after user successfully logs in) */}
      <SubNavbar
        user={user}
        currency={currency}
        cart={cart}
        wishlist={wishlist}
        onNavigateBuyNow={() => handleNavClick('buynow')}
        onOpenTrackOrder={onOpenTrackOrder}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdminPanel={onOpenAdminDashboard}
      />

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF8F4] border-b border-[#EFE6D8] px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-xl max-h-[85vh] overflow-y-auto">
          
          {/* European Language Translator Selection Mobile */}
          <div className="py-2.5 border-b border-[#EFE6D8] space-y-1.5">
            <div className="flex justify-between items-center text-xs font-montserrat uppercase tracking-wider text-[#8C7A6B] font-bold">
              <span className="flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-[#214C3A]" />
                <span>Select European Language</span>
              </span>
              <span className="text-[10px] text-[#214C3A] font-bold">Top 5 Europe</span>
            </div>
            <div className="grid grid-cols-5 gap-1 pt-1">
              {TOP_EUROPEAN_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`py-1.5 px-1 rounded-xl text-xs font-montserrat font-bold flex flex-col items-center justify-center transition-all ${
                    language === lang.code
                      ? 'bg-[#214C3A] text-[#FAF8F4] shadow-sm'
                      : 'bg-[#EFE6D8]/60 text-[#214C3A] hover:bg-[#EFE6D8]'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="text-[9px] uppercase font-mono mt-0.5">{lang.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Nav Links */}
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left py-2.5 font-serif text-lg font-semibold border-b border-[#EFE6D8] ${
              activeTab === 'home' ? 'text-[#214C3A]' : 'text-[#1C1C1C]'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => handleNavClick('about')}
            className={`w-full text-left py-2.5 font-serif text-lg font-semibold border-b border-[#EFE6D8] ${
              activeTab === 'about' ? 'text-[#214C3A]' : 'text-[#1C1C1C]'
            }`}
          >
            About Us
          </button>

          {/* Collections Interactive Collapsible Accordion Dropdown (Mobile & Tablet) */}
          <div className="border-b border-[#EFE6D8] pb-2">
            <button
              type="button"
              onClick={() => setIsMobileCollectionsOpen(!isMobileCollectionsOpen)}
              className="w-full text-left py-2.5 font-serif text-lg font-semibold text-[#1C1C1C] flex justify-between items-center group cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <span className={activeTab === 'collections' ? 'text-[#214C3A]' : ''}>Collections</span>
                <span className="bg-[#214C3A] text-[#D8C6A5] text-[10px] font-montserrat px-2.5 py-0.5 rounded-full font-bold">
                  8 Categories
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 text-[#214C3A] transition-transform duration-300 ${isMobileCollectionsOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Collapsible 8 Collection Cards Grid */}
            {isMobileCollectionsOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 pb-1 animate-fade-in">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleNavClick('collections', cat.id)}
                    className={`p-2.5 rounded-2xl border border-[#EFE6D8] bg-white hover:bg-[#EFE6D8]/50 transition-all cursor-pointer flex items-center space-x-3 shadow-xs active:scale-[0.98] ${
                      selectedCategory === cat.id ? 'border-[#214C3A] bg-[#EFE6D8]/40 ring-1 ring-[#214C3A]' : ''
                    }`}
                  >
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-12 h-12 rounded-xl object-cover border border-[#D8C6A5] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-serif font-bold text-xs text-[#214C3A] truncate">
                        {cat.name}
                      </div>
                      <div className="text-[10px] text-[#8C7A6B] truncate font-sans">
                        {cat.tagline}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => handleNavClick('reviews')}
            className={`w-full text-left py-2.5 font-serif text-lg font-semibold border-b border-[#EFE6D8] ${
              activeTab === 'reviews' ? 'text-[#214C3A]' : 'text-[#1C1C1C]'
            }`}
          >
            Reviews
          </button>

          <button
            onClick={() => handleNavClick('offers')}
            className={`w-full text-left py-2.5 font-serif text-lg font-semibold border-b border-[#EFE6D8] flex items-center justify-between ${
              activeTab === 'offers' ? 'text-[#214C3A]' : 'text-[#1C1C1C]'
            }`}
          >
            <span>Offers & Discounts</span>
            <span className="bg-[#214C3A] text-[#D8C6A5] text-xs px-2 py-0.5 rounded-full font-montserrat font-bold">
              4 Active
            </span>
          </button>

          <button
            onClick={() => handleNavClick('contact')}
            className={`w-full text-left py-2.5 font-serif text-lg font-semibold border-b border-[#EFE6D8] ${
              activeTab === 'contact' ? 'text-[#214C3A]' : 'text-[#1C1C1C]'
            }`}
          >
            Contact Us
          </button>

          {/* Logged Out / Logged In Quick Actions Mobile Drawer */}
          {!user.isLoggedIn ? (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsAuthOpen(true);
              }}
              className="w-full bg-[#214C3A] text-[#FAF8F4] py-3 rounded-xl font-montserrat font-bold text-xs uppercase tracking-wider mt-3 shadow-md flex items-center justify-center space-x-2"
            >
              <User className="w-4 h-4 text-[#D8C6A5]" />
              <span>Login / Signup Account</span>
            </button>
          ) : (
            <div className="pt-2 border-t border-[#EFE6D8] space-y-2">
              <div className="text-xs font-montserrat uppercase tracking-wider text-[#8C7A6B] font-bold">
                Logged In as: {user.name} ({user.role.toUpperCase()})
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleNavClick('buynow');
                  }}
                  className="bg-[#D8C6A5] text-[#214C3A] py-2.5 px-3 rounded-xl text-xs font-montserrat font-bold flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Buy Now</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenTrackOrder();
                  }}
                  className="bg-[#214C3A] text-[#FAF8F4] py-2.5 px-3 rounded-xl text-xs font-montserrat font-bold flex items-center justify-center space-x-1.5"
                >
                  <PackageCheck className="w-3.5 h-3.5 text-[#D8C6A5]" />
                  <span>Track Order</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsWishlistOpen(true);
                  }}
                  className="bg-[#EFE6D8] text-[#214C3A] py-2.5 px-3 rounded-xl text-xs font-montserrat font-bold flex items-center justify-center space-x-1.5"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Wishlist ({wishlist.length})</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="bg-[#EFE6D8] text-[#214C3A] py-2.5 px-3 rounded-xl text-xs font-montserrat font-bold flex items-center justify-center space-x-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Cart ({cartCount})</span>
                </button>
              </div>

              {/* Admin Panel Button Mobile (RBAC) */}
              {user.role === 'admin' && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAdminDashboard();
                  }}
                  className="w-full bg-gradient-to-r from-[#C5A059] to-[#D8C6A5] text-[#214C3A] py-3 rounded-xl font-montserrat font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md border border-[#FAF8F4]/30"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Open HQ Admin Control Console</span>
                </button>
              )}
            </div>
          )}

        </div>
      )}
    </header>
  );
};
