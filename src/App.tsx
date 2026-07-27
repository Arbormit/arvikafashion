import React, { useState, useEffect } from 'react';
import { ActiveTab, Currency, Product, CartItem, WishlistItem, Coupon, User, Order, WhatsAppProductContext } from './types';
import { PRODUCTS } from './data/products';
import { db } from './services/db';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BrandPillars } from './components/BrandPillars';
import { TrendingGrid } from './components/TrendingGrid';
import { AboutUs } from './components/AboutUs';
import { StatsCounter } from './components/StatsCounter';
import { CollectionsView } from './components/CollectionsView';
import { ReviewsSection } from './components/ReviewsSection';
import { OffersSection } from './components/OffersSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { SearchModal } from './components/SearchModal';
import { FloatingWhatsAppCTA } from './components/FloatingWhatsAppCTA';
import { TaxInvoiceModal } from './components/TaxInvoiceModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { Footer } from './components/Footer';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currency, setCurrency] = useState<Currency>('INR');

  // Shopping State (with localStorage persistence)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('arvika_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('arvika_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // User Auth State from DB service
  const [user, setUser] = useState<User>(() => db.getCurrentUser());

  // UI Modal & Drawer States
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // New Production Modals
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [selectedTaxInvoiceOrder, setSelectedTaxInvoiceOrder] = useState<Order | null>(null);
  const [isTaxInvoiceOpen, setIsTaxInvoiceOpen] = useState(false);

  // Sync user state with user preference currency
  useEffect(() => {
    if (user.preferences?.currency) {
      setCurrency(user.preferences.currency);
    }
  }, [user]);

  // Persist State Updates
  useEffect(() => {
    localStorage.setItem('arvika_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('arvika_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Set Wishlist IDs helper set
  const wishlistIds = new Set(wishlist.map(w => w.product.id));

  // Cart Handler Functions
  const handleAddToCart = (product: Product, color: string, size: string, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.color === color && item.size === size
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: `cart-${product.id}-${color}-${size}`,
            product,
            color,
            size,
            quantity
          }
        ];
      }
    });
  };

  const handleBuyNow = (product: Product, color: string, size: string, quantity: number = 1) => {
    handleAddToCart(product, color, size, quantity);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(id);
      return;
    }
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item)));
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Wishlist Handler
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((w) => w.product.id === product.id);
      if (exists) {
        return prev.filter((w) => w.product.id !== product.id);
      } else {
        return [...prev, { id: `wish-${product.id}`, product }];
      }
    });
  };

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((w) => w.product.id !== productId));
  };

  // Order Complete Handler
  const handleOrderComplete = (order: Order) => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Open Invoice View
  const handleViewInvoice = (order: Order) => {
    setSelectedTaxInvoiceOrder(order);
    setIsTaxInvoiceOpen(true);
  };

  // Derive WhatsApp Floating Product Context
  const whatsAppProductContext: WhatsAppProductContext | null = quickViewProduct
    ? {
        product: quickViewProduct,
        selectedColor: quickViewProduct.colors[0]?.name,
        selectedSize: quickViewProduct.sizes[0],
        quantity: 1,
        appliedCoupon
      }
    : cart.length > 0
    ? {
        product: cart[cart.length - 1].product,
        selectedColor: cart[cart.length - 1].color,
        selectedSize: cart[cart.length - 1].size,
        quantity: cart[cart.length - 1].quantity,
        appliedCoupon
      }
    : null;

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#1C1C1C] flex flex-col font-sans selection:bg-[#214C3A] selection:text-[#FAF8F4]">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        currency={currency}
        setCurrency={setCurrency}
        cart={cart}
        wishlist={wishlist}
        setIsCartOpen={setIsCartOpen}
        setIsWishlistOpen={setIsWishlistOpen}
        setIsAuthOpen={setIsAuthOpen}
        setIsProfileOpen={setIsProfileOpen}
        user={user}
        setUser={setUser}
        onSearchOpen={() => setIsSearchOpen(true)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-grow">
        
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            <Hero 
              setActiveTab={setActiveTab} 
              setSelectedCategory={setSelectedCategory} 
            />
            <BrandPillars />
            <TrendingGrid
              products={PRODUCTS}
              currency={currency}
              onQuickView={setQuickViewProduct}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlistIds}
              onExploreAll={() => {
                setActiveTab('collections');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <StatsCounter />
            <AboutUs />
            <ReviewsSection />
          </div>
        )}

        {/* ABOUT US TAB */}
        {activeTab === 'about' && (
          <div className="space-y-12 animate-fade-in">
            <AboutUs />
            <StatsCounter />
            <BrandPillars />
          </div>
        )}

        {/* COLLECTIONS TAB */}
        {(activeTab === 'collections' || activeTab === 'buynow') && (
          <div className="animate-fade-in">
            <CollectionsView
              products={PRODUCTS}
              currency={currency}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onQuickView={setQuickViewProduct}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlistIds}
            />
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="animate-fade-in">
            <ReviewsSection />
          </div>
        )}

        {/* OFFERS TAB */}
        {activeTab === 'offers' && (
          <div className="animate-fade-in">
            <OffersSection
              currency={currency}
              onApplyCoupon={(code) => {
                setIsCartOpen(true);
              }}
              activeCouponCode={appliedCoupon?.code || null}
              onGoToShop={() => {
                setActiveTab('collections');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer 
        setActiveTab={setActiveTab} 
        setSelectedCategory={setSelectedCategory} 
      />

      {/* Floating WhatsApp CTA */}
      <FloatingWhatsAppCTA
        productContext={whatsAppProductContext}
        currency={currency}
      />

      {/* Global Modals & Drawers */}
      <ProductDetailModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        currency={currency}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={quickViewProduct ? wishlistIds.has(quickViewProduct.id) : false}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        currency={currency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        appliedCoupon={appliedCoupon}
        setAppliedCoupon={setAppliedCoupon}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        currency={currency}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onAddToCart={handleAddToCart}
        onQuickView={setQuickViewProduct}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        currency={currency}
        appliedCoupon={appliedCoupon}
        user={user}
        onOrderComplete={handleOrderComplete}
        onViewInvoice={handleViewInvoice}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        setUser={setUser}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        setUser={setUser}
        currency={currency}
        onViewInvoice={handleViewInvoice}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={PRODUCTS}
        currency={currency}
        onQuickView={setQuickViewProduct}
      />

      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
        currency={currency}
        onViewInvoice={handleViewInvoice}
      />

      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        currency={currency}
        onViewInvoice={handleViewInvoice}
      />

      <TaxInvoiceModal
        isOpen={isTaxInvoiceOpen}
        onClose={() => setIsTaxInvoiceOpen(false)}
        order={selectedTaxInvoiceOrder}
        currency={currency}
      />

    </div>
  );
}
