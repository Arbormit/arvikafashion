import { User, Order, Address, OrderStatus, PaymentStatus, PaymentDetails, CartItem, Currency, UserPreferences, Review, Inquiry } from '../types';
import { PRODUCTS } from '../data/products';
import { INITIAL_REVIEWS } from '../data/reviews';
import { AuthService } from './authService';

const STORAGE_KEYS = {
  USERS: 'arvika_users',
  CURRENT_USER: 'arvika_current_user',
  ORDERS: 'arvika_db_orders',
  ANNOUNCEMENTS: 'arvika_announcements',
  REVIEWS: 'arvika_reviews',
};

// Default Shop Details
export const SHOP_UPI_ID = 'arvika.fashion@okicici';
export const SHOP_NAME = 'ARVIKA FASHION PVT LTD';
export const SHOP_PHONE = '+91 9891179374';
export const SHOP_PHONE_2 = '+91 9716505898';
export const SHOP_EMAIL = 'export@arvikafashion.com';

// Generate unique tracking ID e.g. ARV-20260727-8X4K9P
export const generateOrderTrackingId = (): string => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // avoid ambiguous characters
  let salt = '';
  for (let i = 0; i < 6; i++) {
    salt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ARV-${dateStr}-${salt}`;
};

// Generate Tax Invoice Number e.g. INV-2026-08942
export const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const seq = Math.floor(10000 + Math.random() * 90000);
  return `INV-${year}-${seq}`;
};

// Seed unauthenticated visitor guest account
export const DEFAULT_ANNOUNCEMENTS: string[] = [
  'Use Code EUROPE15 for 15% OFF First Order',
  'European & Global Export Headquarters',
  'GST Registered & OEKO-TEX® Certified Manufacturer',
  'Top 5 European Languages Supported (EN, FR, DE, ES, IT)'
];

export const DEFAULT_GUEST: User = {
  id: '',
  name: 'Guest Visitor',
  email: '',
  phone: '',
  role: 'customer',
  isLoggedIn: false,
  addresses: [],
  preferences: {
    currency: 'INR',
    emailNotifications: false,
    whatsappAlerts: false,
    marketingOptIn: false,
  },
  createdAt: '2026-01-01T00:00:00.000Z'
};

// Seed default registered accounts (NOT auto-logged in)
export const DEFAULT_CUSTOMER: User = {
  id: 'usr_freja_2026',
  name: 'Freja Lindqvist',
  email: 'freja.lindqvist@copenhagen.dk',
  phone: '+45 20 12 34 56',
  role: 'customer',
  isLoggedIn: false,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  addresses: [
    {
      id: 'addr_1',
      label: 'Home - Copenhagen',
      fullName: 'Freja Lindqvist',
      phone: '+45 20 12 34 56',
      street: 'Grønnegade 14, Apt 3B',
      city: 'Copenhagen',
      state: 'Capital Region',
      zipCode: '1107',
      country: 'Denmark',
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
    {
      id: 'addr_2',
      label: 'Stockholm Design Studio',
      fullName: 'Freja Lindqvist',
      phone: '+46 70 987 6543',
      street: 'Strandvägen 12',
      city: 'Stockholm',
      state: 'Stockholm Län',
      zipCode: '114 56',
      country: 'Sweden',
      isDefaultShipping: false,
      isDefaultBilling: false,
    }
  ],
  preferences: {
    currency: 'EUR',
    emailNotifications: true,
    whatsappAlerts: true,
    marketingOptIn: true,
  },
  createdAt: '2026-01-15T10:00:00.000Z'
};

export const DEFAULT_ADMIN: User = {
  id: 'usr_admin_001',
  name: 'Store Admin (Arvika HQ)',
  email: 'admin@arvikafashion.com',
  phone: '+91 9891179374',
  role: 'admin',
  isLoggedIn: false,
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
  addresses: [
    {
      id: 'addr_hq',
      label: 'Arvika Atelier HQ',
      fullName: 'Arvika Fashion Pvt Ltd',
      phone: '+91 9891179374',
      street: 'Plot 42, Export Promotion Industrial Park',
      city: 'Faridabad',
      state: 'Haryana',
      zipCode: '121003',
      country: 'India',
      isDefaultShipping: true,
      isDefaultBilling: true,
    }
  ],
  preferences: {
    currency: 'INR',
    emailNotifications: true,
    whatsappAlerts: true,
    marketingOptIn: false,
  },
  createdAt: '2025-11-01T10:00:00.000Z'
};

// Initial order repository (starts empty until real orders are placed)
const SEEDED_ORDERS: Order[] = [];

class DatabaseService {
  private users: User[] = [];
  private currentUser: User = DEFAULT_GUEST;
  private orders: Order[] = [];
  private announcements: string[] = DEFAULT_ANNOUNCEMENTS;
  private reviews: Review[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (savedUsers) {
        const parsed: User[] = JSON.parse(savedUsers);
        // Filter out any legacy dummy demo accounts
        this.users = parsed.filter(u => u.id !== 'usr_freja_2026' && u.id !== 'usr_admin_001');
        this.saveUsers();
      } else {
        this.users = [];
        this.saveUsers();
      }

      const savedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (savedCurrentUser) {
        const parsed = JSON.parse(savedCurrentUser);
        // Clean legacy auto-logged in demo session
        if (parsed.id === 'usr_freja_2026' || parsed.id === 'usr_admin_001' || !parsed.email) {
          this.currentUser = DEFAULT_GUEST;
          this.saveCurrentUser();
        } else if (parsed.isLoggedIn && AuthService.isUserSessionTampered(parsed)) {
          console.warn('[SECURITY WARNING] Detected client-side user session tampering! Resetting session to unauthenticated.');
          this.logout();
        } else {
          this.currentUser = parsed;
        }
      } else {
        this.currentUser = DEFAULT_GUEST;
        this.saveCurrentUser();
      }

      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (savedOrders) {
        this.orders = JSON.parse(savedOrders);
      } else {
        this.orders = [];
        this.saveOrders();
      }

      const savedAnnouncements = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (savedAnnouncements) {
        this.announcements = JSON.parse(savedAnnouncements);
      } else {
        this.announcements = DEFAULT_ANNOUNCEMENTS;
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
      }

      const savedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (savedReviews) {
        const parsed: Review[] = JSON.parse(savedReviews);
        // Filter out legacy demo seed reviews
        this.reviews = parsed.filter((r) => !['rev-101', 'rev-102', 'rev-103', 'rev-104', 'rev-105', 'rev-1', 'rev-2', 'rev-3'].includes(r.id));
        this.saveReviewsToStorage();
      } else {
        this.reviews = [];
        this.saveReviewsToStorage();
      }

      // Fetch live data from Neon PostgreSQL DB
      this.syncReviewsFromNeonServer();
      this.syncUsersFromNeonServer();
      this.syncInquiriesFromNeonServer();

      // Real-time Neon DB role poller & window focus listener
      if (typeof window !== 'undefined') {
        setInterval(() => this.syncUsersFromNeonServer(), 4000);
        setInterval(() => this.syncInquiriesFromNeonServer(), 4000);
        window.addEventListener('focus', () => {
          this.syncUsersFromNeonServer();
          this.syncInquiriesFromNeonServer();
        });
      }
    } catch (e) {
      console.error('Failed to initialize database service:', e);
      this.users = [];
      this.currentUser = DEFAULT_GUEST;
      this.orders = [];
      this.announcements = DEFAULT_ANNOUNCEMENTS;
      this.reviews = [];
    }
  }

  private saveUsers() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
  }

  private saveCurrentUser() {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
    if (this.currentUser && this.currentUser.id) {
      const sig = AuthService.generateClientSignature(this.currentUser);
      localStorage.setItem(`arvika_sig_${this.currentUser.id}`, sig);
    }
  }

  private saveOrders() {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
  }

  // --- USER API ---
  public getCurrentUser(): User {
    // Audit check on read to prevent client-side prototype/role tampering
    if (this.currentUser.isLoggedIn && AuthService.isUserSessionTampered(this.currentUser)) {
      console.warn('[SECURITY WARNING] Current user role tampered! Forcing logout.');
      this.logout();
    }
    return this.currentUser;
  }

  public setCurrentUser(user: User): void {
    this.currentUser = user;
    this.saveCurrentUser();

    // Sync in user list
    const idx = this.users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx > -1) {
      this.users[idx] = user;
    } else {
      this.users.push(user);
    }
    this.saveUsers();
  }

  public login(email: string, requestedRole?: 'customer' | 'admin'): User {
    const cleanEmail = AuthService.sanitize(email).toLowerCase();
    
    // Check existing database users
    const existing = this.users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    // Retain saved DB role if user exists, otherwise default strictly to customer. NO AUTOMATIC ADMIN CREATION!
    const assignedRole: 'customer' | 'admin' = existing ? existing.role : 'customer';

    if (existing) {
      const updated: User = { 
        ...existing, 
        role: assignedRole, 
        isLoggedIn: true 
      };
      this.setCurrentUser(updated);
      return updated;
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      role: 'customer', // NO AUTOMATIC ADMIN! Always starts as customer.
      isLoggedIn: true,
      addresses: [],
      preferences: {
        currency: 'INR',
        emailNotifications: true,
        whatsappAlerts: true,
        marketingOptIn: false,
      },
      createdAt: new Date().toISOString()
    };

    this.setCurrentUser(newUser);
    return newUser;
  }

  public signup(name: string, email: string, password?: string): User {
    const cleanName = AuthService.sanitize(name);
    const cleanEmail = AuthService.sanitize(email).toLowerCase();

    // Cryptographic salted password hashing
    const { salt, hash } = AuthService.hashPassword(password || 'CustomerPass123!');

    // STRICT RBAC SECURITY RULE: New registrations ALWAYS get role: 'customer'
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: 'customer', // HARDCODED - Cannot be overridden by user input or payload tampering
      isLoggedIn: true,
      addresses: [],
      preferences: {
        currency: 'INR',
        emailNotifications: true,
        whatsappAlerts: true,
        marketingOptIn: true,
      },
      createdAt: new Date().toISOString()
    };

    // Store salt and hash securely on user object (never store plaintext password)
    (newUser as any).salt = salt;
    (newUser as any).hash = hash;

    this.setCurrentUser(newUser);

    // Save directly to Neon PostgreSQL DB
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cleanName, email: cleanEmail, password: password || 'CustomerPass123!' })
    }).then(() => this.syncUsersFromNeonServer()).catch((err) => console.warn('Neon DB user sync error:', err));

    return newUser;
  }

  public logout(): void {
    const guestUser: User = {
      id: '',
      name: '',
      email: '',
      role: 'customer',
      isLoggedIn: false,
      addresses: [],
      preferences: {
        currency: 'INR',
        emailNotifications: false,
        whatsappAlerts: false,
        marketingOptIn: false,
      }
    };
    if (this.currentUser && this.currentUser.id) {
      localStorage.removeItem(`arvika_sig_${this.currentUser.id}`);
    }
    this.currentUser = guestUser;
    this.saveCurrentUser();
    AuthService.clearAuthToken();
  }

  public updateUserProfile(
    userId: string,
    updates: Partial<Omit<User, 'id' | 'role'>>
  ): User {
    const user = this.users.find((u) => u.id === userId) || this.currentUser;
    const updatedUser: User = {
      ...user,
      ...updates,
      // Retain strictly existing role (role cannot be updated via profile edit)
      role: user.role,
      preferences: {
        ...user.preferences,
        ...(updates.preferences || {})
      }
    };

    this.setCurrentUser(updatedUser);
    return updatedUser;
  }

  // --- ADDRESS MANAGEMENT ---
  public saveAddress(userId: string, address: Address): User {
    const user = this.users.find((u) => u.id === userId) || this.currentUser;
    let addresses = [...(user.addresses || [])];

    if (address.isDefaultShipping) {
      addresses = addresses.map((a) => ({ ...a, isDefaultShipping: false }));
    }
    if (address.isDefaultBilling) {
      addresses = addresses.map((a) => ({ ...a, isDefaultBilling: false }));
    }

    const existingIdx = addresses.findIndex((a) => a.id === address.id);
    if (existingIdx > -1) {
      addresses[existingIdx] = address;
    } else {
      addresses.push(address);
    }

    return this.updateUserProfile(user.id, { addresses });
  }

  public deleteAddress(userId: string, addressId: string): User {
    const user = this.users.find((u) => u.id === userId) || this.currentUser;
    const addresses = user.addresses.filter((a) => a.id !== addressId);
    return this.updateUserProfile(user.id, { addresses });
  }

  public updateUserRole(userId: string, newRole: 'admin' | 'customer'): boolean {
    const idx = this.users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      this.users[idx].role = newRole;
      this.saveUsers();

      if (this.currentUser.id === userId) {
        this.currentUser.role = newRole;
        this.saveCurrentUser();
      }

      if (typeof fetch !== 'undefined') {
        fetch(`/api/users/${userId}/role`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole })
        }).catch((err) => console.warn('Neon DB role update error:', err));
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('arvika_role_changed'));
      }
      return true;
    }
    return false;
  }

  public deleteUser(userId: string): boolean {
    const initialLen = this.users.length;
    this.users = this.users.filter((u) => u.id !== userId);
    this.saveUsers();

    if (typeof fetch !== 'undefined') {
      fetch(`/api/users/${userId}`, { method: 'DELETE' })
        .then(() => this.syncUsersFromNeonServer())
        .catch((err) => console.warn('Neon DB user deletion error:', err));
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('arvika_user_updated'));
    }

    return this.users.length < initialLen;
  }

  // --- ORDER & PAYMENT MANAGEMENT ---
  public createOrder(orderParams: {
    userId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    items: CartItem[];
    subtotalINR: number;
    subtotalEUR: number;
    discountINR: number;
    discountEUR: number;
    totalINR: number;
    totalEUR: number;
    currency: Currency;
    paymentMethod: 'UPI' | 'CARD' | 'WIRE' | 'COD';
    upiId?: string;
    utrNumber?: string;
    shippingAddress: Address;
    billingAddress: Address;
  }): Order {
    const trackingId = generateOrderTrackingId();
    const invoiceNumber = generateInvoiceNumber();
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const nowIso = new Date().toISOString();

    const isVerifiedImmediately = orderParams.paymentMethod === 'UPI' && !!orderParams.utrNumber;
    const paymentStatus: PaymentStatus = isVerifiedImmediately ? 'PAYMENT_VERIFIED' : 'PENDING_VERIFICATION';
    const orderStatus: OrderStatus = isVerifiedImmediately ? 'Payment Verified' : 'Pending';

    const paymentDetails: PaymentDetails = {
      method: orderParams.paymentMethod,
      upiId: orderParams.upiId || SHOP_UPI_ID,
      utrNumber: orderParams.utrNumber,
      transactionId: orderParams.utrNumber ? `TXN-UPI-${orderParams.utrNumber}` : `TXN-${Date.now()}`,
      verifiedAt: isVerifiedImmediately ? nowIso : undefined,
      verifiedBy: isVerifiedImmediately ? 'SYSTEM' : undefined,
      amountPaid: orderParams.currency === 'INR' ? orderParams.totalINR : orderParams.totalEUR,
      currency: orderParams.currency
    };

    const trackingNumber = `DHL-EXP-${Math.floor(100000000 + Math.random() * 900000000)}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      orderTrackingId: trackingId,
      invoiceNumber,
      userId: orderParams.userId,
      customerName: AuthService.sanitize(orderParams.customerName),
      customerEmail: AuthService.sanitize(orderParams.customerEmail).toLowerCase(),
      customerPhone: AuthService.sanitize(orderParams.customerPhone),
      date: dateStr,
      timestamp: Date.now(),
      items: orderParams.items,
      subtotalINR: orderParams.subtotalINR,
      subtotalEUR: orderParams.subtotalEUR,
      discountINR: orderParams.discountINR,
      discountEUR: orderParams.discountEUR,
      totalINR: orderParams.totalINR,
      totalEUR: orderParams.totalEUR,
      currency: orderParams.currency,
      status: orderStatus,
      paymentStatus,
      paymentDetails,
      shippingAddress: orderParams.shippingAddress,
      billingAddress: orderParams.billingAddress,
      trackingNumber,
      carrier: 'DHL Express Worldwide / BlueDart Air',
      estimatedDelivery: new Date(Date.now() + 5 * 86400 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      statusHistory: [
        {
          status: 'Pending',
          timestamp: nowIso,
          note: `Order placed via ${orderParams.paymentMethod}.`
        },
        ...(isVerifiedImmediately ? [{
          status: 'Payment Verified' as OrderStatus,
          timestamp: nowIso,
          note: `UPI UTR ${orderParams.utrNumber} verified instantly.`
        }] : [])
      ]
    };

    this.orders.unshift(newOrder);
    this.saveOrders();
    return newOrder;
  }

  public verifyPayment(orderTrackingId: string, utrNumber?: string, adminEmail?: string): Order | null {
    const order = this.orders.find((o) => o.orderTrackingId === orderTrackingId || o.id === orderTrackingId);
    if (!order) return null;

    const nowIso = new Date().toISOString();
    order.paymentStatus = 'PAYMENT_VERIFIED';
    order.paymentDetails.verifiedAt = nowIso;
    order.paymentDetails.verifiedBy = adminEmail || 'ADMIN';
    if (utrNumber) {
      order.paymentDetails.utrNumber = utrNumber;
      order.paymentDetails.transactionId = `TXN-UPI-${utrNumber}`;
    }

    if (order.status === 'Pending') {
      order.status = 'Payment Verified';
      order.statusHistory.push({
        status: 'Payment Verified',
        timestamp: nowIso,
        note: `Payment verified by ${adminEmail || 'Store Administrator'}. UTR/Ref: ${order.paymentDetails.utrNumber || 'N/A'}`
      });
    }

    this.saveOrders();
    return order;
  }

  public updateOrderStatus(orderTrackingId: string, status: OrderStatus, note?: string): Order | null {
    const order = this.orders.find((o) => o.orderTrackingId === orderTrackingId || o.id === orderTrackingId);
    if (!order) return null;

    const nowIso = new Date().toISOString();
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: nowIso,
      note: note || `Status updated to ${status}`
    });

    this.saveOrders();
    return order;
  }

  public getOrdersByUserId(userId: string, email?: string): Order[] {
    return this.orders.filter(
      (o) => o.userId === userId || (email && o.customerEmail.toLowerCase() === email.toLowerCase())
    );
  }

  public getOrderByTrackingId(trackingId: string): Order | null {
    const cleanId = trackingId.trim().toUpperCase();
    return this.orders.find(
      (o) => o.orderTrackingId.toUpperCase() === cleanId || o.invoiceNumber.toUpperCase() === cleanId || o.id.toUpperCase() === cleanId
    ) || null;
  }

  public getAllOrders(): Order[] {
    return this.orders;
  }

  public getAllUsers(): User[] {
    return [...this.users.filter(u => u.email && u.id !== 'usr_freja_2026' && u.id !== 'usr_admin_001')];
  }

  public getAnnouncements(): string[] {
    return this.announcements.length > 0 ? this.announcements : DEFAULT_ANNOUNCEMENTS;
  }

  public updateAnnouncements(newAnnouncements: string[]): boolean {
    if (this.currentUser.role !== 'admin') {
      console.error('[RBAC SECURITY VIOLATION] Unauthorized attempt to update announcements:', this.currentUser.email);
      return false;
    }
    const filtered = newAnnouncements.map((a) => a.trim()).filter((a) => a.length > 0);
    this.announcements = filtered.length > 0 ? filtered : DEFAULT_ANNOUNCEMENTS;
    try {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(this.announcements));
      window.dispatchEvent(new Event('arvika_announcements_updated'));
      return true;
    } catch (err) {
      console.error('Failed to save announcements:', err);
      return false;
    }
  }

  /**
   * Delete an order record. Strictly restricted to admin accounts.
   */
  public deleteOrder(orderTrackingId: string): boolean {
    if (this.currentUser.role !== 'admin') {
      console.error('[RBAC SECURITY VIOLATION] Unauthorized attempt to delete order:', this.currentUser.email);
      return false;
    }
    const cleanId = orderTrackingId.trim().toUpperCase();
    const initialLength = this.orders.length;
    this.orders = this.orders.filter(
      (o) => o.orderTrackingId.toUpperCase() !== cleanId && o.id.toUpperCase() !== cleanId
    );
    this.saveOrders();
    return this.orders.length < initialLength;
  }
  // ==================== LIVE REVIEWS & NEON DB SYNC ====================
  private syncReviewsFromNeonServer() {
    if (typeof fetch === 'undefined') return;
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          this.reviews = data.reviews;
          this.saveReviewsToStorage();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('arvika_reviews_updated'));
          }
        }
      })
      .catch((err) => console.warn('Neon DB reviews fetch notice:', err));
  }

  public syncUsersFromNeonServer() {
    if (typeof fetch === 'undefined') return;
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.users)) {
          this.users = data.users;
          this.saveUsers();

          // Real-time check if active logged-in user's role was modified directly in Neon DB
          if (this.currentUser && this.currentUser.isLoggedIn && this.currentUser.email) {
            const dbMatch = data.users.find((u: User) => u.email.toLowerCase() === this.currentUser.email.toLowerCase());
            if (dbMatch && dbMatch.role && dbMatch.role !== this.currentUser.role) {
              console.log(`[NEON DB ROLE SYNC] Dynamic role update detected in Neon DB: ${this.currentUser.role} ➔ ${dbMatch.role}`);
              this.currentUser.role = dbMatch.role;
              const newSig = AuthService.generateClientSignature(this.currentUser);
              localStorage.setItem(`arvika_sig_${this.currentUser.id}`, newSig);
              this.saveCurrentUser();

              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('arvika_user_updated', { detail: this.currentUser }));
                window.dispatchEvent(new Event('arvika_role_changed'));
              }
            }
          }
        }
      })
      .catch((err) => console.warn('Neon DB users fetch notice:', err));
  }

  // ==================== INQUIRIES & NEON DB SYNC ====================
  private inquiries: Inquiry[] = [];

  public getInquiries(): Inquiry[] {
    return [...this.inquiries];
  }

  public syncInquiriesFromNeonServer() {
    if (typeof fetch === 'undefined') return;
    fetch('/api/inquiries')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.inquiries)) {
          this.inquiries = data.inquiries;
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('arvika_inquiries_updated'));
          }
        }
      })
      .catch((err) => console.warn('Neon DB inquiries fetch notice:', err));
  }

  public addInquiry(newInquiry: Omit<Inquiry, 'id' | 'createdAt'>): Inquiry {
    const created: Inquiry = {
      ...newInquiry,
      id: `inq_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      status: 'New',
      createdAt: new Date().toISOString()
    };

    this.inquiries = [created, ...this.inquiries];

    if (typeof fetch !== 'undefined') {
      fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInquiry)
      })
        .then(() => this.syncInquiriesFromNeonServer())
        .catch((err) => console.warn('Neon DB inquiry save error:', err));
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('arvika_inquiries_updated'));
    }

    return created;
  }

  public deleteInquiry(id: string): boolean {
    const initialLen = this.inquiries.length;
    this.inquiries = this.inquiries.filter((inq) => inq.id !== id);

    if (typeof fetch !== 'undefined') {
      fetch(`/api/inquiries/${id}`, { method: 'DELETE' })
        .then(() => this.syncInquiriesFromNeonServer())
        .catch((err) => console.warn('Neon DB inquiry delete error:', err));
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('arvika_inquiries_updated'));
    }

    return this.inquiries.length < initialLen;
  }

  public updateInquiryStatus(id: string, status: 'New' | 'Replied' | 'Resolved'): boolean {
    const match = this.inquiries.find((inq) => inq.id === id);
    if (match) {
      match.status = status;
      if (typeof fetch !== 'undefined') {
        fetch(`/api/inquiries/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        }).catch((err) => console.warn('Neon DB inquiry status update error:', err));
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('arvika_inquiries_updated'));
      }
      return true;
    }
    return false;
  }

  getReviews(): Review[] {
    return [...this.reviews];
  }

  addReview(newReview: Omit<Review, 'id' | 'date' | 'helpfulCount'>): Review {
    const created: Review = {
      ...newReview,
      id: `rev-real-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      helpfulCount: 0
    };

    this.reviews = [created, ...this.reviews];
    this.saveReviewsToStorage();

    // Asynchronously POST to Neon PostgreSQL Database
    if (typeof fetch !== 'undefined') {
      fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      }).catch((err) => console.warn('Neon DB review save error:', err));
    }
    
    // Broadcast real-time review update across all open browser components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('arvika_reviews_updated'));
    }

    return created;
  }

  voteHelpfulReview(reviewId: string): boolean {
    const index = this.reviews.findIndex(r => r.id === reviewId);
    if (index !== -1) {
      this.reviews[index].helpfulCount += 1;
      this.saveReviewsToStorage();

      if (typeof fetch !== 'undefined') {
        fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' })
          .catch((err) => console.warn('Neon DB vote error:', err));
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('arvika_reviews_updated'));
      }
      return true;
    }
    return false;
  }

  deleteReview(reviewId: string): boolean {
    const initialLen = this.reviews.length;
    this.reviews = this.reviews.filter((r) => r.id !== reviewId);
    this.saveReviewsToStorage();

    if (typeof fetch !== 'undefined') {
      fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' })
        .catch((err) => console.warn('Neon DB review deletion error:', err));
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('arvika_reviews_updated'));
    }

    return this.reviews.length < initialLen;
  }

  private saveReviewsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(this.reviews));
    } catch (e) {
      console.warn('Failed to save reviews to localStorage:', e);
    }
  }
}

export const db = new DatabaseService();
