import { User, Order, Address, OrderStatus, PaymentStatus, PaymentDetails, CartItem, Currency, UserPreferences } from '../types';
import { PRODUCTS } from '../data/products';

const STORAGE_KEYS = {
  USERS: 'arvika_users',
  CURRENT_USER: 'arvika_current_user',
  ORDERS: 'arvika_db_orders',
};

// Default Shop Details
export const SHOP_UPI_ID = 'arvika.fashion@okicici';
export const SHOP_NAME = 'ARVIKA FASHION PVT LTD';
export const SHOP_PHONE = '+91 98765 43210';
export const SHOP_EMAIL = 'concierge@arvikafashion.com';

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

// Seed default accounts
export const DEFAULT_CUSTOMER: User = {
  id: 'usr_freja_2026',
  name: 'Freja Lindqvist',
  email: 'freja.lindqvist@copenhagen.dk',
  phone: '+45 20 12 34 56',
  role: 'customer',
  isLoggedIn: true,
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
  phone: '+91 98765 43210',
  role: 'admin',
  isLoggedIn: true,
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
  addresses: [
    {
      id: 'addr_hq',
      label: 'Arvika Atelier HQ',
      fullName: 'Arvika Fashion Pvt Ltd',
      phone: '+91 98765 43210',
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

// Pre-seeded orders for rich initial experience
const SEEDED_ORDERS: Order[] = [
  {
    id: 'ord_1001',
    orderTrackingId: 'ARV-20260720-9X2M4K',
    invoiceNumber: 'INV-2026-10492',
    userId: 'usr_freja_2026',
    customerName: 'Freja Lindqvist',
    customerEmail: 'freja.lindqvist@copenhagen.dk',
    customerPhone: '+45 20 12 34 56',
    date: 'July 20, 2026',
    timestamp: Date.now() - 7 * 86400 * 1000,
    items: [
      {
        id: 'cart-1',
        product: PRODUCTS[0],
        color: PRODUCTS[0].colors[0].name,
        size: 'M',
        quantity: 1
      },
      {
        id: 'cart-2',
        product: PRODUCTS[2],
        color: PRODUCTS[2].colors[0].name,
        size: 'S',
        quantity: 1
      }
    ],
    subtotalINR: 19980,
    subtotalEUR: 218,
    discountINR: 1998,
    discountEUR: 21.8,
    totalINR: 17982,
    totalEUR: 196.2,
    currency: 'EUR',
    status: 'Shipped',
    paymentStatus: 'PAYMENT_VERIFIED',
    paymentDetails: {
      method: 'UPI',
      upiId: 'freja@okicici',
      utrNumber: '928374651029',
      transactionId: 'TXN-UPI-928374651029',
      verifiedAt: '2026-07-20T14:32:00.000Z',
      verifiedBy: 'SYSTEM',
      amountPaid: 17982,
      currency: 'INR'
    },
    shippingAddress: DEFAULT_CUSTOMER.addresses[0],
    billingAddress: DEFAULT_CUSTOMER.addresses[0],
    trackingNumber: 'DHL-EXP-984210394',
    carrier: 'DHL Express Worldwide',
    estimatedDelivery: 'July 28, 2026',
    statusHistory: [
      { status: 'Pending', timestamp: '2026-07-20T14:30:00.000Z', note: 'Order submitted by customer' },
      { status: 'Payment Verified', timestamp: '2026-07-20T14:32:00.000Z', note: 'UPI UTR 928374651029 auto-verified with bank ledger' },
      { status: 'Processing', timestamp: '2026-07-21T09:00:00.000Z', note: 'Tailored and quality inspected at Faridabad Export Atelier' },
      { status: 'Shipped', timestamp: '2026-07-23T11:15:00.000Z', note: 'Handed over to DHL Express. Air Waybill #DHL-EXP-984210394' }
    ]
  }
];

class DatabaseService {
  private users: User[] = [];
  private currentUser: User = DEFAULT_CUSTOMER;
  private orders: Order[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (savedUsers) {
        this.users = JSON.parse(savedUsers);
      } else {
        this.users = [DEFAULT_CUSTOMER, DEFAULT_ADMIN];
        this.saveUsers();
      }

      const savedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (savedCurrentUser) {
        this.currentUser = JSON.parse(savedCurrentUser);
      } else {
        this.currentUser = DEFAULT_CUSTOMER;
        this.saveCurrentUser();
      }

      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (savedOrders) {
        this.orders = JSON.parse(savedOrders);
      } else {
        this.orders = SEEDED_ORDERS;
        this.saveOrders();
      }
    } catch {
      this.users = [DEFAULT_CUSTOMER, DEFAULT_ADMIN];
      this.currentUser = DEFAULT_CUSTOMER;
      this.orders = SEEDED_ORDERS;
    }
  }

  private saveUsers() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
  }

  private saveCurrentUser() {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
  }

  private saveOrders() {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
  }

  // --- USER API ---
  public getCurrentUser(): User {
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

  public login(email: string, role: 'customer' | 'admin' = 'customer'): User {
    const existing = this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existing) {
      const updated = { ...existing, role, isLoggedIn: true };
      this.setCurrentUser(updated);
      return updated;
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email,
      role,
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

  public logout(): void {
    this.currentUser = {
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
    this.saveCurrentUser();
  }

  public updateUserProfile(
    userId: string,
    updates: Partial<Omit<User, 'id' | 'role'>>
  ): User {
    const user = this.users.find((u) => u.id === userId) || this.currentUser;
    const updatedUser: User = {
      ...user,
      ...updates,
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
      customerName: orderParams.customerName,
      customerEmail: orderParams.customerEmail,
      customerPhone: orderParams.customerPhone,
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
}

export const db = new DatabaseService();
