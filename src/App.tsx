import React, { useState, useEffect } from 'react';
import { ShoppingBag, Heart } from 'lucide-react';
import { ActiveTab, Currency, Language, Product, CartItem, WishlistItem, Coupon, User, Order, WhatsAppProductContext } from './types';
import { db } from './services/db';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
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
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { TaxInvoiceModal } from './components/TaxInvoiceModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { ForbiddenView } from './components/ForbiddenView';
import { ContactPage } from './components/ContactPage';
import { applyLanguageTranslation } from './data/translations';
import { Footer } from './components/Footer';

export default function App() {
  // Navigation & Route State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currency, setCurrency] = useState<Currency>('INR');
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('arvika_language');
      return (saved as Language) || 'en';
    } catch {
      return 'en';
    }
  });
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.hash || window.location.pathname);

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

  // Dynamic Products List from database service
  const [productsList, setProductsList] = useState<Product[]>(() => db.getProducts());

  useEffect(() => {
    const handleProductsUpdate = () => setProductsList(db.getProducts());
    window.addEventListener('arvika_products_updated', handleProductsUpdate);
    return () => window.removeEventListener('arvika_products_updated', handleProductsUpdate);
  }, []);

  // User Auth State from DB service
  const [user, setUser] = useState<User>(() => db.getCurrentUser());

  // UI Modal & Drawer States
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [pendingCheckoutIntent, setPendingCheckoutIntent] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Production Modals
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [selectedTaxInvoiceOrder, setSelectedTaxInvoiceOrder] = useState<Order | null>(null);
  const [isTaxInvoiceOpen, setIsTaxInvoiceOpen] = useState(false);

  // URL Router Hash/Path Listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      const routeStr = hash || path;
      setCurrentPath(routeStr);

      if (routeStr === '#admin' || routeStr === '/admin') {
        if (user.isLoggedIn && user.role === 'admin') {
          setIsAdminDashboardOpen(true);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, [user]);

  // Listen for dynamic user role updates straight from Neon DB
  useEffect(() => {
    const handleUserRoleUpdate = () => {
      const updatedUser = db.getCurrentUser();
      setUser(updatedUser);
    };
    window.addEventListener('arvika_user_updated', handleUserRoleUpdate);
    window.addEventListener('arvika_role_changed', handleUserRoleUpdate);
    return () => {
      window.removeEventListener('arvika_user_updated', handleUserRoleUpdate);
      window.removeEventListener('arvika_role_changed', handleUserRoleUpdate);
    };
  }, []);

  // Sync user state with user preference currency
  useEffect(() => {
    if (user.preferences?.currency) {
      setCurrency(user.preferences.currency);
    }
  }, [user]);

  // Persist language preference & trigger full page translation
  useEffect(() => {
    localStorage.setItem('arvika_language', language);
    applyLanguageTranslation(language);
  }, [language]);

  // Persist State Updates
  useEffect(() => {
    localStorage.setItem('arvika_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('arvika_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Set Wishlist & Cart IDs helper sets
  const wishlistIds = new Set(wishlist.map(w => w.product.id));
  const cartItemIds = new Set(cart.map(c => c.product.id));

  // Global Toast Alert Notification State
  const [globalToast, setGlobalToast] = useState<{ message: string; type: 'cart' | 'wishlist' } | null>(null);

  const triggerGlobalToast = (message: string, type: 'cart' | 'wishlist') => {
    setGlobalToast({ message, type });
    setTimeout(() => setGlobalToast(null), 3200);
  };

  // Cart Handler Functions
  const handleAddToCart = (product: Product, color: string, size: string, quantity: number = 1) => {
    try {
      localStorage.removeItem('arvika_whatsapp_cleared');
      setIsWhatsAppCleared(false);
    } catch (e) {
      console.error(e);
    }

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

    triggerGlobalToast(`Added "${product.name}" (${color}, Size: ${size}) to your Shopping Bag! 🛍️`, 'cart');
  };

  const handleBuyNow = (product: Product, color: string, size: string, quantity: number = 1) => {
    handleAddToCart(product, color, size, quantity);
    setIsCartOpen(false);

    if (!user.isLoggedIn) {
      setPendingCheckoutIntent(true);
      setAuthInitialMode('signup');
      setIsAuthOpen(true);
      triggerGlobalToast(`Please register an account to complete your purchase of "${product.name}"`, 'cart');
      return;
    }

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
        triggerGlobalToast(`Removed "${product.name}" from your Favorites Wishlist`, 'wishlist');
        return prev.filter((w) => w.product.id !== product.id);
      } else {
        triggerGlobalToast(`Added "${product.name}" to your Favorites Wishlist! ❤️`, 'wishlist');
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

  // Admin Dashboard Trigger with RBAC Enforcement
  const handleOpenAdminDashboard = () => {
    if (!user.isLoggedIn) {
      setIsAuthOpen(true);
      return;
    }

    if (user.role === 'admin') {
      window.location.hash = 'admin';
      setIsAdminDashboardOpen(true);
    } else {
      // Direct access to protected admin route by unauthorized user
      window.location.hash = 'admin';
      setCurrentPath('#admin');
    }
  };

  // Check if current route is protected admin route
  const isAdminRouteActive = currentPath === '#admin' || currentPath === '/admin';
  const isAuthorizedAdmin = user.isLoggedIn && user.role === 'admin';
  const showForbiddenScreen = isAdminRouteActive && !isAuthorizedAdmin;

  // WhatsApp Context Clearing State with LocalStorage Persistence
  const [isWhatsAppCleared, setIsWhatsAppCleared] = useState<boolean>(() => {
    try {
      return localStorage.getItem('arvika_whatsapp_cleared') === 'true';
    } catch {
      return false;
    }
  });

  const handleClearWhatsAppProductContext = () => {
    setIsWhatsAppCleared(true);
    try {
      localStorage.setItem('arvika_whatsapp_cleared', 'true');
    } catch (e) {
      console.error(e);
    }
  };

  // Derive WhatsApp Floating Product Context
  const whatsAppProductContext: WhatsAppProductContext | null = isWhatsAppCleared
    ? null
    : quickViewProduct
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
    <div className="min-h-screen bg-[#1C1C1C] text-[#1C1C1C] flex flex-col font-sans selection:bg-[#214C3A] selection:text-[#FAF8F4]">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (window.location.hash === '#admin') {
            window.history.replaceState(null, '', window.location.pathname);
          }
          setActiveTab(tab);
        }}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        currency={currency}
        setCurrency={setCurrency}
        language={language}
        setLanguage={setLanguage}
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
        onOpenAdminDashboard={handleOpenAdminDashboard}
      />

      {/* Main View Router */}
      <main className="flex-grow bg-[#FAF8F4]">
        
        {/* FORBIDDEN SCREEN: Renders when non-admin accesses #admin or /admin */}
        {showForbiddenScreen ? (
          <ForbiddenView
            user={user}
            onGoHome={() => {
              window.history.replaceState(null, '', window.location.pathname);
              setCurrentPath('');
              setActiveTab('home');
            }}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        ) : (
          <>
            {/* HOME TAB */}
            {activeTab === 'home' && (
              <div className="space-y-4">
                <Hero 
                  setActiveTab={setActiveTab} 
                  setSelectedCategory={setSelectedCategory} 
                />
                <StatsCounter />
                <TrendingGrid
                  products={productsList}
                  currency={currency}
                  onQuickView={setQuickViewProduct}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onToggleWishlist={handleToggleWishlist}
                  wishlistIds={wishlistIds}
                  cartItemIds={cartItemIds}
                  onExploreAll={() => {
                    setActiveTab('collections');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
                <AboutUs />
                <ReviewsSection />
              </div>
            )}

            {/* ABOUT US TAB */}
            {activeTab === 'about' && (
              <div className="space-y-12 animate-fade-in">
                <AboutUs />
                <StatsCounter />
              </div>
            )}

            {/* COLLECTIONS TAB */}
            {(activeTab === 'collections' || activeTab === 'buynow') && (
              <div className="animate-fade-in">
                <CollectionsView
                  products={productsList}
                  currency={currency}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  onQuickView={setQuickViewProduct}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onToggleWishlist={handleToggleWishlist}
                  wishlistIds={wishlistIds}
                  cartItemIds={cartItemIds}
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

            {/* CONTACT US TAB */}
            {activeTab === 'contact' && (
              <div className="animate-fade-in">
                <ContactPage />
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <Footer 
        setActiveTab={(tab) => {
          if (window.location.hash === '#admin') {
            window.history.replaceState(null, '', window.location.pathname);
          }
          setActiveTab(tab);
        }} 
        setSelectedCategory={setSelectedCategory} 
      />

      {/* Floating CTAs & Navigation Helpers */}
      <FloatingWhatsAppCTA
        productContext={whatsAppProductContext}
        currency={currency}
        onClearProductContext={handleClearWhatsAppProductContext}
      />
      <ScrollToTopButton />

      {/* Global Action Popup Alert Notification */}
      {globalToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#214C3A] text-[#FAF8F4] px-6 py-3.5 rounded-full text-xs sm:text-sm font-montserrat font-bold shadow-2xl border-2 border-[#C5A059] flex items-center space-x-3 animate-fade-in max-w-md w-[92vw] sm:w-auto text-center">
          {globalToast.type === 'cart' ? (
            <ShoppingBag className="w-5 h-5 text-[#D8C6A5] shrink-0" />
          ) : (
            <Heart className="w-5 h-[#D8C6A5] text-[#D8C6A5] shrink-0" />
          )}
          <span className="truncate">{globalToast.message}</span>
        </div>
      )}

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
        isAddedToCart={quickViewProduct ? cartItemIds.has(quickViewProduct.id) : false}
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
          if (!user.isLoggedIn) {
            setPendingCheckoutIntent(true);
            setAuthInitialMode('signup');
            setIsAuthOpen(true);
            triggerGlobalToast(`Please register an account to complete your checkout`, 'cart');
            return;
          }
          setIsCheckoutOpen(true);
        }}
        user={user}
        onOpenAuth={() => {
          setAuthInitialMode('login');
          setIsAuthOpen(true);
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
        onClose={() => {
          setIsAuthOpen(false);
          setPendingCheckoutIntent(false);
        }}
        setUser={setUser}
        initialMode={authInitialMode}
        onAuthSuccess={(loggedOrSignedUser) => {
          setUser(loggedOrSignedUser);
          if (pendingCheckoutIntent) {
            setPendingCheckoutIntent(false);
            setIsCheckoutOpen(true);
            triggerGlobalToast(`Welcome, ${loggedOrSignedUser.name}! Proceeding to your checkout.`, 'cart');
          }
        }}
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
        products={productsList}
        currency={currency}
        onQuickView={setQuickViewProduct}
      />

      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
        currency={currency}
        onViewInvoice={handleViewInvoice}
      />

      {isAuthorizedAdmin && (
        <AdminDashboardModal
          isOpen={isAdminDashboardOpen}
          onClose={() => {
            setIsAdminDashboardOpen(false);
            if (window.location.hash === '#admin') {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
          currency={currency}
          onViewInvoice={handleViewInvoice}
        />
      )}

      <TaxInvoiceModal
        isOpen={isTaxInvoiceOpen}
        onClose={() => setIsTaxInvoiceOpen(false)}
        order={selectedTaxInvoiceOrder}
        currency={currency}
      />

    </div>
  );
}
