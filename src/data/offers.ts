import { Coupon } from '../types';

export const COUPONS: Coupon[] = [
  {
    code: 'EUROPE15',
    description: '15% OFF on your order over ₹5,000 or €60 for European & Indian Clients',
    discountPercentage: 15,
    minOrderINR: 5000,
    minOrderEUR: 60,
    expiresAt: '2026-12-31',
    badge: 'WELCOME PROMO'
  },
  {
    code: 'LINEN20',
    description: '20% OFF on all Pure Linen Couture & Scandinavian Dresses',
    discountPercentage: 20,
    minOrderINR: 6000,
    minOrderEUR: 75,
    categoryRestriction: 'pure-linen',
    expiresAt: '2026-12-31',
    badge: 'SEASONAL FAVOURITE'
  },
  {
    code: 'EXPORTELEGANCE',
    description: 'Flat ₹1,500 (€18) OFF on orders above ₹12,000 or €150',
    discountFixedINR: 1500,
    discountFixedEUR: 18,
    minOrderINR: 12000,
    minOrderEUR: 150,
    expiresAt: '2026-12-31',
    badge: 'VIP EXECUTIVE'
  },
  {
    code: 'FREESHIP',
    description: 'Free Express Global DHL & BlueDart Doorstep Delivery',
    discountFixedINR: 500,
    discountFixedEUR: 12,
    minOrderINR: 8000,
    minOrderEUR: 100,
    expiresAt: '2026-12-31',
    badge: 'FREE EXPRESS SHIPPING'
  }
];
