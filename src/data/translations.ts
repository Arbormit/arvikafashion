import { Language } from '../types';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const TOP_EUROPEAN_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' }
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    home: 'Home',
    aboutUs: 'About Us',
    collections: 'Collections',
    reviews: 'Reviews',
    offers: 'Offers',
    buyNow: 'Buy Now',
    trackOrder: 'Track Order',
    wishlist: 'Wishlist',
    myCart: 'My Cart',
    adminPanel: 'Admin Panel',
    loginSignup: 'Login / Signup',
    profile: 'Profile',
    searchCatalog: 'Search Catalog...',
    announcementText: 'European & Global Export Headquarters | GST Registered & OEKO-TEX® Certified',
    promoCode: 'Use Code EUROPE15 for 15% OFF First Order',
    heroTagline: 'ECO-CERTIFIED NORMANDY FLAX & HANDLOOM GARMENTS',
    heroTitle: 'Quiet Luxury. Sustainable Couture.',
    heroSubtitle: 'Tailored with French seams and pre-washed for vintage softness.',
    exploreCollections: 'Explore Collections',
    activeOffers: '4 Active Offers',
    clientPrivileges: 'Client Privileges Active',
    vipAdminWorkspace: 'VIP Admin Workspace'
  },
  de: {
    home: 'Startseite',
    aboutUs: 'Über Uns',
    collections: 'Kollektionen',
    reviews: 'Bewertungen',
    offers: 'Angebote',
    buyNow: 'Jetzt Kaufen',
    trackOrder: 'Bestellung Verfolgen',
    wishlist: 'Wunschliste',
    myCart: 'Warenkorb',
    adminPanel: 'Admin-Konsole',
    loginSignup: 'Anmelden / Registrieren',
    profile: 'Profil',
    searchCatalog: 'Katalog durchsuchen...',
    announcementText: 'Europäische & Globale Exportzentrale | GST-Registriert & OEKO-TEX® Zertifiziert',
    promoCode: 'Gutscheincode EUROPE15 für 15% Rabatt',
    heroTagline: 'ÖKO-ZERTIFIZIERTER NORMANDIE-FLACHS & HANDWEBBEKLEIDUNG',
    heroTitle: 'Dezenter Luxus. Nachhaltige Couture.',
    heroSubtitle: 'Maßgeschneidert mit französischen Nähten und vorgewaschen für Vintage-Weichheit.',
    exploreCollections: 'Kollektionen Erkunden',
    activeOffers: '4 Aktive Angebote',
    clientPrivileges: 'Kundenprivilegien Aktiv',
    vipAdminWorkspace: 'VIP Admin-Arbeitsbereich'
  },
  fr: {
    home: 'Accueil',
    aboutUs: 'À Propos',
    collections: 'Collections',
    reviews: 'Avis Clients',
    offers: 'Offres Spéciales',
    buyNow: 'Acheter',
    trackOrder: 'Suivre Commande',
    wishlist: 'Favoris',
    myCart: 'Mon Panier',
    adminPanel: 'Panneau Admin',
    loginSignup: 'Connexion / Inscription',
    profile: 'Mon Profil',
    searchCatalog: 'Rechercher dans le catalogue...',
    announcementText: 'Siège d\'Exportation Européen & Mondial | Certifié OEKO-TEX®',
    promoCode: 'Code EUROPE15 pour -15% sur la 1ère commande',
    heroTagline: 'LIN DE NORMANDIE ÉCO-CERTIFIÉ & COUTURE ARTISANALE',
    heroTitle: 'Luxe Discret. Couture Durable.',
    heroSubtitle: 'Confectionné avec coutures anglaises et prélavé pour une douceur vintage.',
    exploreCollections: 'Découvrir les Collections',
    activeOffers: '4 Offres Actives',
    clientPrivileges: 'Privilèges Clients Actifs',
    vipAdminWorkspace: 'Espace Admin VIP'
  },
  es: {
    home: 'Inicio',
    aboutUs: 'Sobre Nosotros',
    collections: 'Colecciones',
    reviews: 'Reseñas',
    offers: 'Ofertas',
    buyNow: 'Comprar Ahora',
    trackOrder: 'Rastrear Pedido',
    wishlist: 'Lista de Deseos',
    myCart: 'Mi Carrito',
    adminPanel: 'Panel de Control',
    loginSignup: 'Iniciar Sesión / Registro',
    profile: 'Perfil',
    searchCatalog: 'Buscar en el catálogo...',
    announcementText: 'Sede de Exportación Europea y Global | Certificación OEKO-TEX®',
    promoCode: 'Usa el Código EUROPE15 para un 15% de Descuento',
    heroTagline: 'LINO DE NORMANDÍA ECO-CERTIFICADO Y COSTURA ARTESANAL',
    heroTitle: 'Lujo Silencioso. Alta Costura Sostenible.',
    heroSubtitle: 'Confeccionado con costuras francesas y prelavado para una suavidad vintage.',
    exploreCollections: 'Explorar Colecciones',
    activeOffers: '4 Ofertas Activas',
    clientPrivileges: 'Privilegios de Cliente Activos',
    vipAdminWorkspace: 'Panel de Administración VIP'
  },
  it: {
    home: 'Home',
    aboutUs: 'Chi Siamo',
    collections: 'Collezioni',
    reviews: 'Recensioni',
    offers: 'Offerte',
    buyNow: 'Acquista Ora',
    trackOrder: 'Traccia Ordine',
    wishlist: 'Lista Desideri',
    myCart: 'Il Mio Carrello',
    adminPanel: 'Pannello Admin',
    loginSignup: 'Accedi / Registrati',
    profile: 'Profilo',
    searchCatalog: 'Cerca nel catalogo...',
    announcementText: 'Sede Principale di Esportazione Europea e Globale | Certificato OEKO-TEX®',
    promoCode: 'Usa il Codice EUROPE15 per il 15% di Sconto',
    heroTagline: 'LINO DELLA NORMANDIA ECO-CERTIFICATO E SARTORIA ARTIGIANALE',
    heroTitle: 'Lusso Discreto. Alta Moda Sostenibile.',
    heroSubtitle: 'Confezionato con cuciture all\'inglese e prelavato per una morbidezza vintage.',
    exploreCollections: 'Esplora le Collezioni',
    activeOffers: '4 Offerte Attive',
    clientPrivileges: 'Privilegi Cliente Attivi',
    vipAdminWorkspace: 'Area Riservata Admin VIP'
  }
};

export const getTranslation = (key: string, lang: Language): string => {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en?.[key] || key;
};

/**
 * Triggers full website DOM translation using Google Translate Engine
 */
export const applyLanguageTranslation = (langCode: Language) => {
  try {
    if (typeof document === 'undefined') return;

    const host = window.location.hostname;
    const path = '/';
    
    if (langCode === 'en') {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
      if (host) {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=.${host}`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${host}`;
      }
    } else {
      document.cookie = `googtrans=/en/${langCode}; expires=Thu, 01 Jan 2099 00:00:00 UTC; path=${path}`;
      if (host) {
        document.cookie = `googtrans=/en/${langCode}; expires=Thu, 01 Jan 2099 00:00:00 UTC; path=${path}; domain=.${host}`;
        document.cookie = `googtrans=/en/${langCode}; expires=Thu, 01 Jan 2099 00:00:00 UTC; path=${path}; domain=${host}`;
      }
    }

    const triggerCombo = () => {
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (combo) {
        combo.value = langCode;
        combo.dispatchEvent(new Event('change'));
      }
    };

    triggerCombo();
    setTimeout(triggerCombo, 300);
    setTimeout(triggerCombo, 800);
  } catch (err) {
    console.error('Translation trigger error:', err);
  }
};
