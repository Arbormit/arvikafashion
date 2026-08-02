export type Currency = 'INR' | 'EUR';

export type Language = 'en' | 'de' | 'fr' | 'es' | 'it';

export type UserRole = 'customer' | 'admin';

export type OrderStatus = 
  | 'Pending' 
  | 'Payment Verified' 
  | 'Processing' 
  | 'Shipped' 
  | 'Out for Delivery' 
  | 'Delivered' 
  | 'Cancelled';

export type PaymentStatus = 
  | 'PENDING_VERIFICATION' 
  | 'PAYMENT_VERIFIED' 
  | 'FAILED' 
  | 'REFUNDED';

export type PaymentMethod = 'UPI' | 'CARD' | 'WIRE' | 'COD';

export interface Address {
  id: string;
  label: string; // e.g. 'Home', 'Office', 'European Studio'
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export interface UserPreferences {
  currency: Currency;
  emailNotifications: boolean;
  whatsappAlerts: boolean;
  marketingOptIn: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isLoggedIn: boolean;
  avatar?: string;
  addresses: Address[];
  preferences: UserPreferences;
  createdAt?: string;
}

export interface PaymentDetails {
  method: PaymentMethod;
  upiId?: string;
  utrNumber?: string;
  transactionId: string;
  verifiedAt?: string;
  verifiedBy?: string; // 'SYSTEM' | 'ADMIN'
  amountPaid: number;
  currency: Currency;
}

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  orderTrackingId: string; // e.g. ARV-20260727-8X4K9P
  invoiceNumber: string; // e.g. INV-2026-08942
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  timestamp: number;
  items: CartItem[];
  subtotalINR: number;
  subtotalEUR: number;
  discountINR: number;
  discountEUR: number;
  totalINR: number;
  totalEUR: number;
  currency: Currency;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentDetails: PaymentDetails;
  shippingAddress: Address;
  billingAddress: Address;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  statusHistory: StatusHistoryItem[];
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle?: string;
  categoryId: string;
  categoryName: string;
  priceINR: number;
  priceEUR: number;
  originalPriceINR?: number;
  originalPriceEUR?: number;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[]; // e.g. ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  fabric: string; // e.g., '100% European Certified Organic Linen'
  gsm?: number;
  fit: string; // e.g., 'Relaxed Scandinavian Fit'
  description: string;
  sustainabilityNotes: string;
  isTrending?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  rating: number;
  reviewCount: number;
  sku: string;
  inStock: boolean;
}

export interface Category {
  id: string;
  name: string;
  tagline: string;
  image: string;
  itemCount: number;
  featuredFabric: string;
  description: string;
}

export interface CartItem {
  id: string;
  product: Product;
  color: string;
  size: string;
  quantity: number;
}

export interface WishlistItem {
  id: string;
  product: Product;
  addedAt?: string;
}

export interface Review {
  id: string;
  productId?: string;
  productName?: string;
  userName: string;
  country: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  isVerifiedBuyer: boolean;
  userAvatar?: string;
  helpfulCount: number;
}

export interface Coupon {
  code: string;
  description: string;
  discountPercentage?: number;
  discountFixedINR?: number;
  discountFixedEUR?: number;
  minOrderINR: number;
  minOrderEUR: number;
  categoryRestriction?: string;
  expiresAt: string;
  badge: string;
}

export interface WhatsAppProductContext {
  product: Product;
  selectedColor?: string;
  selectedSize?: string;
  quantity?: number;
  appliedCoupon?: Coupon | null;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status?: 'New' | 'Replied' | 'Resolved';
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
  lastWeeklyEmailSentAt?: string;
}

export type ActiveTab = 'home' | 'about' | 'collections' | 'reviews' | 'offers' | 'buynow' | 'contact';

