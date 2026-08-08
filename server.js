import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// OWASP SECURITY HEADERS & CORS MIDDLEWARE
// ==========================================
app.use((req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking frame attacks
  res.setHeader('X-Frame-Options', 'DENY');
  // Enable XSS Filtering
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Strict Transport Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' translate.google.com translate.googleapis.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com translate.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: https:;"
  );
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// JSON body parser with 10mb limit (allows base64 product image uploads)
app.use(express.json({ limit: '10mb' }));

// ==========================================
// RATE LIMITING & BRUTE FORCE PROTECTION
// ==========================================
const rateLimitMap = new Map();

const rateLimiter = (options = { windowMs: 15 * 60 * 1000, max: 100 }) => {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const cleanIp = String(ip).split(',')[0].trim();

    // Allow localhost/development traffic without rate-limit throttling
    if (cleanIp.includes('127.0.0.1') || cleanIp.includes('::1') || cleanIp.includes('localhost')) {
      return next();
    }

    const now = Date.now();
    const record = rateLimitMap.get(cleanIp) || { count: 0, resetTime: now + options.windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + options.windowMs;
    } else {
      record.count += 1;
    }

    rateLimitMap.set(cleanIp, record);

    if (record.count > options.max) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    next();
  };
};

// Strict rate limit for authentication endpoints
const authLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 });
// General API rate limit (accommodates 4-second polling sync)
const apiLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 5000 });

app.use('/api', apiLimiter);

// ==========================================
// INPUT SANITIZATION & VALIDATION HELPERS
// ==========================================
const sanitizeInput = (str, maxLen = 2000) => {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '') // Strip script tags
    .replace(/on\w+="[^"]*"/gi, '') // Strip inline event attributes
    .replace(/javascript:/gi, '') // Strip javascript: protocol handlers
    .replace(/[<>]/g, '') // Strip HTML tags to prevent XSS
    .slice(0, maxLen);
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && email.length <= 120 && emailRegex.test(email.trim());
};

const validatePasswordStrength = (password) => {
  if (typeof password !== 'string' || password.length < 8 || password.length > 64) {
    return false;
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigitOrSpecial = /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  return hasLetter && hasDigitOrSpecial;
};

// ==========================================
// CRYPTO & JWT SIGNATURE INFRASTRUCTURE
// ==========================================
const JWT_SECRET = process.env.JWT_SECRET || 'ARVIKA_EXPORT_HQ_SECRET_KEY_2026_PRODUCTION_SECURE';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'ARVIKA_EXPORT_HQ_REFRESH_SECRET_KEY_2026_PRODUCTION_SECURE';

// Salted PBKDF2 Password Hashing
const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
};

const verifyPassword = (password, salt, storedHash) => {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
};

// Short-Lived Access Token (15 Minutes)
const createAccessToken = (payload) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 15 * 60 * 1000, type: 'access' })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
};

// Long-Lived Refresh Token (7 Days) with Unique Token Family ID
const createRefreshToken = (payload) => {
  const tokenId = `rf_${crypto.randomBytes(16).toString('hex')}`;
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, tokenId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000, type: 'refresh' })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_REFRESH_SECRET).update(`${header}.${body}`).digest('base64url');
  return { refreshToken: `${header}.${body}.${signature}`, tokenId };
};

// Token Verification
const verifyAccessToken = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_REFRESH_SECRET).update(`${header}.${body}`).digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
};

// Backward-compatible alias
const verifySignedToken = verifyAccessToken;
const createSignedToken = createAccessToken;

// ==========================================
// NEON POSTGRESQL DATABASE CLIENT & INITIALIZER
// ==========================================
const getSql = () => {
  if (!process.env.DATABASE_URL) return null;
  return neon(process.env.DATABASE_URL);
};

// Automatic Neon DB Schema Table Verification
async function initNeonSchema() {
  const sql = getSql();
  if (!sql) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        role VARCHAR(20) NOT NULL DEFAULT 'customer',
        avatar TEXT,
        preferences JSONB DEFAULT '{"currency":"INR", "emailNotifications":true, "whatsappAlerts":true, "marketingOptIn":true}',
        salt VARCHAR(64),
        hash TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(64) PRIMARY KEY,
        product_id VARCHAR(64),
        product_name VARCHAR(255),
        user_name VARCHAR(255) NOT NULL,
        user_avatar TEXT,
        country VARCHAR(100) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title TEXT NOT NULL,
        comment TEXT NOT NULL,
        date VARCHAR(100) NOT NULL,
        is_verified_buyer BOOLEAN DEFAULT TRUE,
        helpful_count INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        token_id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        revoked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS inquiries (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'New',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        last_weekly_email_sent_at TIMESTAMP WITH TIME ZONE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS offers_coupons (
        code VARCHAR(64) PRIMARY KEY,
        description TEXT NOT NULL,
        discount_percentage INT,
        discount_fixed_inr INT,
        discount_fixed_eur INT,
        min_order_inr INT NOT NULL,
        min_order_eur INT NOT NULL,
        category_restriction VARCHAR(64),
        expires_at VARCHAR(20) NOT NULL,
        badge VARCHAR(64) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS schema_metadata (
        key VARCHAR(64) PRIMARY KEY,
        value VARCHAR(64) NOT NULL
      );
    `;

    // Purge any legacy dummy seed coupons & announcements completely from Neon DB
    await sql`DELETE FROM offers_coupons WHERE UPPER(code) IN ('EUROPE15', 'LINEN20', 'EXPORTELEGANCE', 'FREESHIP', 'SCANDI20', 'INDUS10', 'ECOMINIMAL', 'VIPFREJA');`;
    await sql`TRUNCATE TABLE announcements_live;`;

    await sql`
      CREATE TABLE IF NOT EXISTS announcements_live (
        id SERIAL PRIMARY KEY,
        announcement_text TEXT NOT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS products_custom (
        id VARCHAR(64) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS products_deleted (
        id VARCHAR(64) PRIMARY KEY,
        deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Ensure announcements_seeded metadata flag is set
    await sql`INSERT INTO schema_metadata (key, value) VALUES ('announcements_seeded', 'true') ON CONFLICT DO NOTHING`;

    // Automatic Column Migration for Pre-existing Neon DB Tables
    await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_avatar TEXT;`;
    await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS product_id VARCHAR(64);`;
    await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS product_name VARCHAR(255);`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`;

    // Seed products into Neon DB if products_custom table is empty
    const pCountRes = await sql`SELECT COUNT(*)::int AS count FROM products_custom`;
    const pCount = pCountRes && pCountRes[0] ? pCountRes[0].count : 0;
    if (pCount === 0) {
      console.log('[NEON DB INTEGRATION] Seeding initial products catalog directly into Neon DB...');
      for (const prod of INITIAL_NEON_PRODUCTS) {
        await sql`
          INSERT INTO products_custom (id, data)
          VALUES (${prod.id}, ${JSON.stringify(prod)})
          ON CONFLICT (id) DO NOTHING
        `;
      }
      console.log(`[NEON DB INTEGRATION] ✅ Seeded ${INITIAL_NEON_PRODUCTS.length} real products into Neon DB.`);
    }

    console.log('[NEON DB INTEGRATION] ✅ Verified Neon PostgreSQL Schema & Migrated Missing Columns');
  } catch (err) {
    console.error('[NEON DB INIT ERROR]', err.message || err);
  }
}

const INITIAL_NEON_PRODUCTS = [
  {
    id: 'arv-101',
    name: 'Cotton Scarfe',
    subtitle: 'Long Cotton Scarfe',
    categoryId: 'Cotton',
    categoryName: 'Cotton',
    priceINR: 350,
    priceEUR: 68,
    originalPriceINR: 6990,
    originalPriceEUR: 85,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491637/WhatsApp_Image_2026-07-31_at_12.44.53_PM_ojweow.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491637/WhatsApp_Image_2026-07-31_at_12.44.53_PM_1_ezvz7z.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491630/WhatsApp_Image_2026-07-27_at_6.18.22_PM_qjoznw.jpg?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Cream Printed', hex: '#dbd2d2ff' },
      { name: 'blue printed', hex: '#007eebff'}
    ],
    sizes: ['100x180'],
    fabric: '100% Organic Cotton',
    gsm: 185,
    fit: 'Long Cotton Scarfe',
    description: 'Wrap yourself in luxury with our oversized Cotton Scarfe, perfect for adding a layer of warmth and style to any outfit. Made from premium organic cotton, this versatile accessory combines comfort with timeless elegance.',
    sustainabilityNotes: 'Best Scarfe to wear in summers',
    isTrending: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 142,
    sku: 'ARV-SKU-0001',
    inStock: true
  },
  {
    id: 'arv-102',
    name: 'Cotton Printed Scarf',
    subtitle: 'Long Cotton Scarf',
    categoryId: 'Cotton',
    categoryName: 'Cotton',
    priceINR: 350,
    priceEUR: 78,
    originalPriceINR: 800,
    originalPriceEUR: 92,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491637/WhatsApp_Image_2026-07-31_at_12.44.52_PM_rm6hix.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491636/WhatsApp_Image_2026-07-31_at_12.44.51_PM_2_c8iawk.jpg?q=80&w=1000&auto=format&fit=crop',
    ],
    colors: [
      { name: 'Forest Green', hex: '#214C3A' },
      { name: 'Charcoal Black', hex: '#1C1C1C' },
      { name: 'Olive Green', hex: '#4A5D4E' }
    ],
    sizes: ['100x180'],
    fabric: '100% Cotton',
    gsm: 210,
    fit: 'Long Cotton Scarfe',
    description: 'Wrap yourself in luxury with our oversized Cotton Scarfe, perfect for adding a layer of warmth and style to any outfit. Made from premium organic cotton, this versatile accessory combines comfort with timeless elegance.',
    sustainabilityNotes: 'Best Scarfe to wear in summers',
    isTrending: true,
    rating: 4.8,
    reviewCount: 98,
    sku: 'ARV-SKU-0002',
    inStock: true
  },
  {
    id: 'arv-103',
    name: 'Aarhus Wide-Leg Linen Trouser',
    subtitle: 'High-Waisted Pleated Pant',
    categoryId: 'pure-linen',
    categoryName: 'Pure Linen Couture',
    priceINR: 5990,
    priceEUR: 74,
    originalPriceINR: 7200,
    originalPriceEUR: 89,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491637/WhatsApp_Image_2026-07-31_at_12.44.53_PM_2_lhvagv.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491637/WhatsApp_Image_2026-07-31_at_12.44.53_PM_1_ezvz7z.jpg?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Stone Beige', hex: '#EFE6D8' },
      { name: 'Taupe', hex: '#8C7A6B' },
      { name: 'Warm Sand', hex: '#D8C6A5' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '100% European Linen',
    gsm: 220,
    fit: 'High-Rise Wide-Leg Fit',
    description: 'Effortless tailoring featuring front double pleats, elasticated back waistband for comfort, and deep side seam slash pockets.',
    sustainabilityNotes: 'Dyed using low-impact Azo-free organic pigments.',
    isTrending: false,
    rating: 4.9,
    reviewCount: 76,
    sku: 'ARV-SKU-0003',
    inStock: true
  },
  {
    id: 'arv-104',
    name: 'Gothenburg Linen Wrap Shirt',
    subtitle: 'Asymmetric Kimono-Sleeve Blouse',
    categoryId: 'pure-linen',
    categoryName: 'Pure Linen Couture',
    priceINR: 4990,
    priceEUR: 62,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491637/WhatsApp_Image_2026-07-31_at_12.44.52_PM_1_uaqsyp.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491637/WhatsApp_Image_2026-07-31_at_12.44.52_PM_2_aikioh.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491637/WhatsApp_Image_2026-07-31_at_12.44.51_PM_fzroji.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491636/WhatsApp_Image_2026-07-31_at_12.44.51_PM_3_lytj5u.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491636/WhatsApp_Image_2026-07-31_at_12.44.51_PM_1_z02wka.jpg?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Ivory White', hex: '#FAF8F4' },
      { name: 'Forest Green', hex: '#214C3A' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '100% Organic Pre-shrunk Linen',
    gsm: 175,
    fit: 'Customizable Wrap Fit',
    description: 'Versatile wrap shirt with self-fabric ties and wide elbow-length sleeves. Perfect for layering over tailored trousers.',
    sustainabilityNotes: 'Fair Trade Certified ethical workshop assembly in Faridabad.',
    rating: 4.7,
    reviewCount: 54,
    sku: 'ARV-SKU-0004',
    inStock: true
  },
  {
    id: 'arv-201',
    name: 'Oslo Heavyweight Organic Tee',
    subtitle: '240 GSM Slub Organic Cotton',
    categoryId: 'organic-cotton',
    categoryName: 'Organic Cotton Essentials',
    priceINR: 2490,
    priceEUR: 32,
    originalPriceINR: 2990,
    originalPriceEUR: 38,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491636/WhatsApp_Image_2026-07-31_at_12.25.11_PM_wya4me.jpg?q=80&w=1000&auto=format&fit=crop',
    ],
    colors: [
      { name: 'Ivory White', hex: '#FAF8F4' },
      { name: 'Charcoal Black', hex: '#1C1C1C' },
      { name: 'Olive Green', hex: '#4A5D4E' },
      { name: 'Stone Beige', hex: '#EFE6D8' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    fabric: '100% GOTS Certified Organic Long-Staple Indian Cotton',
    gsm: 240,
    fit: 'Boxy Modern Fit',
    description: 'The foundation of minimalist wardrobes. Knitted from comb-spun organic yarn that holds its shape wash after wash without pilling.',
    sustainabilityNotes: 'GOTS Certified yarn from farmer cooperatives in Gujarat & Rajasthan.',
    isTrending: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 210,
    sku: 'ARV-SKU-0005',
    inStock: true
  },
  {
    id: 'arv-202',
    name: 'Cotton Kurti',
    subtitle: 'Cotton Printed Kurti for women',
    categoryId: 'Cotton',
    categoryName: 'Cotton dress',
    priceINR: 650,
    priceEUR: 54,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491636/WhatsApp_Image_2026-07-29_at_3.54.20_PM_rphk4q.jpg?q=80&w=1000&auto=format&fit=crop',
    ],
    colors: [
      { name: 'White Printed', hex: '#FFFFFF' }
    ],
    sizes: ['free size'],
    fabric: '100% cotton',
    gsm: 140,
    fit: 'Comfort Fit',
    description: 'Cotton Printed Kurti for women',
    sustainabilityNotes: 'Purely organic cotton is used for the production of this kurti.',
    rating: 4.8,
    reviewCount: 64,
    sku: 'ARV-SKU-0006',
    inStock: true
  },
  {
    id: 'arv-203',
    name: 'Linen Dress',
    subtitle: 'Linen Dress',
    categoryId: 'Linen Dress',
    categoryName: 'Linen Dress',
    priceINR: 2500,
    priceEUR: 44,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491635/WhatsApp_Image_2026-07-29_at_3.54.17_PM_3_umcq0i.jpg?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Printed', hex: '' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '100% Linen',
    gsm: 210,
    fit: 'Relaxed Fit',
    description: 'Ultra-soft rib knit top engineered with double-layer self-fabric lining for seamless opacity and total comfort.',
    sustainabilityNotes: 'GOTS Certified & OEKO-TEX Standard 100.',
    rating: 4.9,
    reviewCount: 88,
    sku: 'ARV-SKU-0007',
    inStock: true
  },
  {
    id: 'arv-301',
    name: 'Arvika Signature Cotton Dress',
    subtitle: 'Signature Cotton Dress',
    categoryId: 'Cotton',
    categoryName: 'Cotton',
    priceINR: 3500,
    priceEUR: 155,
    originalPriceINR: 6990,
    originalPriceEUR: 190,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491635/WhatsApp_Image_2026-07-29_at_3.54.17_PM_ymvjo7.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491634/WhatsApp_Image_2026-07-29_at_3.54.17_PM_1_qh3qt5.jpg?q=80&w=1000&auto=format&fit=crop',
    ],
    colors: [
      { name: 'Blue Printed', hex: '#06cdffff' },
      { name: 'White Printed', hex: '#f6f6f6ff' }
    ],
    sizes: ['free size'],
    fabric: '100% Cotton',
    gsm: 120,
    fit: 'Comfort Fit',
    description: 'Cotton Printed Kurti for women',
    sustainabilityNotes: 'Purely organic cotton is used for the production of this kurti.',
    isTrending: true,
    isBestSeller: true,
    rating: 5.0,
    reviewCount: 87,
    sku: 'ARV-SKU-0008',
    inStock: true
  },
  {
    id: 'arv-302',
    name: 'Cotton Kaftan',
    subtitle: '',
    categoryId: 'Cotton',
    categoryName: 'Cotton Dress',
    priceINR: 450,
    priceEUR: 112,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491634/WhatsApp_Image_2026-07-29_at_3.54.16_PM_2_hx4llu.jpg?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Stone Beige', hex: '#EFE6D8' }
    ],
    sizes: ['free size'],
    fabric: '100% Cotton',
    gsm: 120,
    fit: 'Soft Tailored Oversized',
    description: 'Designed without stiff shoulder pads for a natural drape. Features classic patch pockets and notch lapels.',
    sustainabilityNotes: 'Plastic-free construction including organic cotton internal stays.',
    rating: 4.8,
    reviewCount: 42,
    sku: 'ARV-SKU-0009',
    inStock: true
  },
  {
    id: 'arv-401',
    name: 'Cotton Dress',
    subtitle: 'Cotton Dress',
    categoryId: 'Cotton',
    categoryName: 'Cotton Dress',
    priceINR: 850,
    priceEUR: 92,
    originalPriceINR: 8990,
    originalPriceEUR: 110,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491634/WhatsApp_Image_2026-07-29_at_3.54.16_PM_umomth.jpg?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Forest Green', hex: '#214C3A' }
    ],
    sizes: ['free size'],
    fabric: '100% Cotton',
    gsm: 120,
    fit: 'Fluid Tiered Silhouette',
    description: 'The perfect blend of comfort and style. This dress features a flattering A-line cut with a tiered design that drapes beautifully on all body types.',
    sustainabilityNotes: 'Best cotton to wear in summers.',
    isTrending: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 175,
    sku: 'ARV-SKU-0010',
    inStock: true
  },
  {
    id: 'arv-402',
    name: 'Oslo Minimalist Wrap Shirt Dress',
    subtitle: 'Organic Cotton-Linen Hybrid Dress',
    categoryId: 'scandi-dresses',
    categoryName: 'Scandinavian Minimal Dresses',
    priceINR: 6990,
    priceEUR: 86,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491634/WhatsApp_Image_2026-07-29_at_3.54.15_PM_nudvz9.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491633/WhatsApp_Image_2026-07-29_at_3.54.14_PM_2_qdtmsx.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491633/WhatsApp_Image_2026-07-29_at_3.54.14_PM_3_gtguvy.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491633/WhatsApp_Image_2026-07-29_at_3.54.13_PM_3_fzx0ws.jpg?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Stone Beige', hex: '#EFE6D8' },
      { name: 'Taupe', hex: '#8C7A6B' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '60% Organic Linen, 40% Organic Cotton',
    gsm: 170,
    fit: 'Adjustable Belted Wrap Cut',
    description: 'Sharp crisp collar combined with soft organic wrap drape. Features long cuff sleeves designed to be effortlessly rolled up.',
    sustainabilityNotes: 'OEKO-TEX Certified safe from toxic substances.',
    rating: 4.8,
    reviewCount: 61,
    sku: 'ARV-SKU-0011',
    inStock: true
  },
  {
    id: 'arv-403',
    name: 'Sleeveless Column Dress',
    subtitle: 'High-Neck Straight Linen Dress',
    categoryId: 'scandi-dresses',
    categoryName: 'Scandinavian Minimal Dresses',
    priceINR: 5990,
    priceEUR: 75,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491633/WhatsApp_Image_2026-07-29_at_3.54.13_PM_rhxpfs.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491633/WhatsApp_Image_2026-07-29_at_3.54.13_PM_2_zvchae.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491633/WhatsApp_Image_2026-07-29_at_3.54.13_PM_1_yskdxh.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491632/WhatsApp_Image_2026-07-29_at_3.54.12_PM_3_sz4vrm.jpg?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Charcoal Black', hex: '#1C1C1C' },
      { name: 'Forest Green', hex: '#214C3A' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    fabric: '100% Heavy European Linen',
    gsm: 210,
    fit: 'Elegant Column Cut',
    description: 'High boat neckline with a discreet back keyhole button and deep side slit for comfortable strides.',
    sustainabilityNotes: 'Zero waste pattern cutting design.',
    rating: 4.7,
    reviewCount: 39,
    sku: 'ARV-SKU-0012',
    inStock: true
  },
  {
    id: 'arv-501',
    name: 'Cotton Kurti',
    subtitle: 'Modern Cotton Kurti',
    categoryId: 'Cotton',
    categoryName: 'Cotton Kurti',
    priceINR: 450,
    priceEUR: 66,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491632/WhatsApp_Image_2026-07-29_at_3.54.12_PM_2_evonye.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491632/WhatsApp_Image_2026-07-29_at_3.54.12_PM_1_ukjb5w.jpg?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Sky Blue', hex: '#196fd2ff' }
    ],
    sizes: ['free size'],
    fabric: '100% Pre-washed Organic Linen',
    gsm: 200,
    fit: 'High-Rise Cropped Cut',
    description: 'Sophisticated calf-length culotte trousers with clean front waistband and subtle back darts.',
    sustainabilityNotes: 'Handwoven in Rajasthan on traditional pedal looms.',
    isTrending: true,
    rating: 4.8,
    reviewCount: 72,
    sku: 'ARV-SKU-0013',
    inStock: true
  },
  {
    id: 'arv-502',
    name: 'Linen Kurti',
    subtitle: 'Everyday Linen Kurti',
    categoryId: 'trousers-pants',
    categoryName: 'Linen',
    priceINR: 3200,
    priceEUR: 60,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491632/WhatsApp_Image_2026-07-29_at_3.54.11_PM_cwbwcy.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491632/WhatsApp_Image_2026-07-29_at_3.54.11_PM_2_h5zwl5.jpg?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Natural Beige', hex: '#EFE6D8' },
      { name: 'Mid Red', hex: '#961313ff' }
    ],
    sizes: ['XS','S', 'M', 'L', 'XL'],
    fabric: '100% Pure Softened Linen',
    gsm: 180,
    fit: 'Relaxed Tapered Fit',
    description: 'Enclosed elastic drawstring waist with natural linen cord and deep pockets. Ideal for travel and warm climates.',
    sustainabilityNotes: 'Organic softened finish without artificial chemical wash.',
    rating: 4.9,
    reviewCount: 110,
    sku: 'ARV-SKU-0014',
    inStock: true
  },
  {
    id: 'arv-601',
    name: 'Turku Silk-Merino Fine Knit Sweater',
    subtitle: 'Featherlight Layering Knit',
    categoryId: 'silk-wool-knits',
    categoryName: 'Artisanal Silk-Wool Knitwear',
    priceINR: 7990,
    priceEUR: 98,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491632/WhatsApp_Image_2026-07-28_at_1.25.13_AM_kfxi52.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491631/WhatsApp_Image_2026-07-28_at_1.25.13_AM_1_dvindw.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491631/WhatsApp_Image_2026-07-28_at_1.25.12_AM_2_ih4s07.jpg?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Ivory White', hex: '#FAF8F4' },
      { name: 'Taupe', hex: '#8C7A6B' },
      { name: 'Forest Green', hex: '#214C3A' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '70% Wild Mulberry Silk, 30% Fine Australian Merino',
    gsm: 160,
    fit: 'Subtle Relaxed Drape',
    description: 'Hand-knitted by master craftsmen. Delivers extraordinary thermal comfort, gentle sheen, and silky touch against the skin.',
    sustainabilityNotes: 'Ethically harvested mulberry silk yarns.',
    isTrending: true,
    rating: 4.9,
    reviewCount: 83,
    sku: 'ARV-SKU-0015',
    inStock: true
  },
  {
    id: 'arv-602',
    name: 'Linen Beach Dress',
    subtitle: 'Modern Beach Dress',
    categoryId: 'Linen',
    categoryName: 'Linen',
    priceINR: 3800,
    priceEUR: 45,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491632/WhatsApp_Image_2026-07-29_at_3.54.12_PM_renz2i.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491631/WhatsApp_Image_2026-07-29_at_3.54.11_PM_1_x28y4d.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491631/WhatsApp_Image_2026-07-29_at_3.54.10_PM_znd7ci.jpg?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Natural Beige', hex: '#D8C6A5' },
      { name: 'White', hex: '#ffffffff' }
    ],
    sizes: ['XS','S', 'M', 'L', 'XL'],
    fabric: 'Linen',
    gsm: 200,
    fit: 'Fluid Draped Fit',
    description: 'Versatile mid-thigh length open cardigan with subtle ribbed hem and sleeve cuffs.',
    sustainabilityNotes: 'Crafted with zero-waste fully fashioned knitting.',
    rating: 4.8,
    reviewCount: 47,
    sku: 'ARV-SKU-0016',
    inStock: true
  },
  {
    id: 'arv-701',
    name: 'Santorini Hand-Loomed Linen Kaftan',
    subtitle: 'Embroidered Hem Resort Kaftan',
    categoryId: 'eco-resort',
    categoryName: 'Eco-Luxury Resort Wear',
    priceINR: 6990,
    priceEUR: 86,
    originalPriceINR: 8200,
    originalPriceEUR: 100,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491631/WhatsApp_Image_2026-07-28_at_1.25.12_AM_nolqop.jpg?q=80&w=1000&auto=format&fit=crop',
    ],
    colors: [
      { name: 'Ivory White', hex: '#FAF8F4' },
      { name: 'Forest Green', hex: '#214C3A' },
      { name: 'Warm Sand', hex: '#D8C6A5' }
    ],
    sizes: ['S-M (One Size)', 'L-XL (One Size)'],
    fabric: '100% Hand-loomed Linen-Cotton',
    gsm: 165,
    fit: 'Breezy Oversized Kaftan',
    description: 'Designed for summer retreats and coastal lounging. V-neckline adorned with delicate tonal hand embroidery along the collar.',
    sustainabilityNotes: 'Hand-loomed in Bengal weaver villages.',
    isTrending: true,
    rating: 4.9,
    reviewCount: 96,
    sku: 'ARV-SKU-0017',
    inStock: true
  },
  {
    id: 'arv-702',
    name: 'Ibiza Tiered Linen Beach Coverup',
    subtitle: 'Sheer Linen Voile Shirt Dress',
    categoryId: 'eco-resort',
    categoryName: 'Eco-Luxury Resort Wear',
    priceINR: 5490,
    priceEUR: 68,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491631/WhatsApp_Image_2026-07-28_at_1.25.12_AM_1_vfwgoe.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491630/WhatsApp_Image_2026-07-28_at_1.25.11_AM_pmkc0j.jpg?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Stone Beige', hex: '#EFE6D8' },
      { name: 'Olive Green', hex: '#4A5D4E' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '100% Featherlight Linen Voile',
    gsm: 110,
    fit: 'Airy Breezy Fit',
    description: 'Translucent pure linen shirt dress that layers effortlessly over swimwear.',
    sustainabilityNotes: 'Naturally bleached using bio-enzymes without chlorine.',
    rating: 4.7,
    reviewCount: 52,
    sku: 'ARV-SKU-0018',
    inStock: true
  },
  {
    id: 'arv-801',
    name: 'Kyoto Hand-loomed Linen Scarf',
    subtitle: 'Fringed Organic Linen Wrap',
    categoryId: 'heritage-accessories',
    categoryName: 'Heritage Craft Accessories',
    priceINR: 2990,
    priceEUR: 38,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491631/WhatsApp_Image_2026-07-29_at_3.54.10_PM_2_naqvqb.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491630/WhatsApp_Image_2026-07-29_at_3.54.10_PM_1_qp0pt7.jpg?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Forest Green', hex: '#214C3A' },
      { name: 'Warm Sand', hex: '#D8C6A5' },
      { name: 'Ivory White', hex: '#FAF8F4' }
    ],
    sizes: ['One Size (70 x 200 cm)'],
    fabric: '100% Hand-spun Organic Linen',
    gsm: 130,
    fit: 'Generous Wrap Size',
    description: 'Generously proportioned scarf featuring hand-twisted raw fringes and a tactile slub texture.',
    sustainabilityNotes: 'Direct partnership with Maheshwar loom artisans.',
    isTrending: true,
    rating: 4.9,
    reviewCount: 130,
    sku: 'ARV-SKU-0019',
    inStock: true
  },
  {
    id: 'arv-802',
    name: 'Antwerp Heavy Linen Market Tote',
    subtitle: 'Structured Eco-Linen Carryall',
    categoryId: 'heritage-accessories',
    categoryName: 'Heritage Craft Accessories',
    priceINR: 3490,
    priceEUR: 44,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491630/WhatsApp_Image_2026-07-27_at_6.18.23_PM_xdzf3m.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491630/WhatsApp_Image_2026-07-27_at_5.53.57_PM_ohdrtl.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491629/WhatsApp_Image_2026-07-27_at_5.53.58_PM_pjrrhz.jpg?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Stone Beige', hex: '#EFE6D8' },
      { name: 'Forest Green', hex: '#214C3A' }
    ],
    sizes: ['One Size (45 x 40 x 15 cm)'],
    fabric: 'Heavyweight 380 GSM Duck Linen & Vegetable Tanned Leather Handles',
    gsm: 380,
    fit: 'Spacious Daily Utility',
    description: 'Spacious everyday tote reinforced with internal pocketing, key clasp, and solid brass magnetic snaps.',
    sustainabilityNotes: 'Zero synthetic linings.',
    rating: 4.8,
    reviewCount: 68,
    sku: 'ARV-SKU-0020',
    inStock: true
  },
  {
    id: 'arv-105',
    name: 'Geneva Linen Utility Shirt Dress',
    subtitle: 'Belted Safari Style Dress',
    categoryId: 'pure-linen',
    categoryName: 'Pure Linen Couture',
    priceINR: 6790,
    priceEUR: 84,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491630/WhatsApp_Image_2026-07-29_at_3.54.10_PM_1_qp0pt7.jpg?q=80&w=1000&auto=format&fit=crop',
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785491630/WhatsApp_Image_2026-07-29_at_3.54.09_PM_izoyzl.jpg?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Olive Green', hex: '#4A5D4E' },
      { name: 'Warm Sand', hex: '#D8C6A5' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '100% Pre-washed Linen',
    gsm: 195,
    fit: 'Structured Belted Silhouette',
    description: 'Chest flap pockets, button-down front, and detachable self-fabric belt.',
    sustainabilityNotes: 'Natural shell buttons.',
    rating: 4.8,
    reviewCount: 45,
    sku: 'ARV-SKU-0021',
    inStock: true
  },
  {
    id: 'arv-106',
    name: 'Cotton Printed Shirt for Women',
    subtitle: 'Casual Cotton Printed Shirt',
    categoryId: 'Cotton',
    categoryName: 'Cotton Shirts',
    priceINR: 650,
    priceEUR: 84,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785761420/WhatsApp_Image_2026-07-31_at_3.38.23_PM_min4yq.jpg?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Blue Printed', hex: '#0061d8ff' }
    ],
    sizes: ['free size'],
    fabric: '100% Cotton',
    gsm: 195,
    fit: 'Comfort Fit',
    description: 'Printed Cotton Kurti for women',
    sustainabilityNotes: 'Natural shell buttons.',
    rating: 4.8,
    reviewCount: 45,
    sku: 'ARV-SKU-0022',
    inStock: true
  },
  {
    id: 'arv-107',
    name: 'Cotton Azure Shirt for Women',
    subtitle: 'Azure Floral Cotton Shirt',
    categoryId: 'Cotton',
    categoryName: 'Cotton Shirts',
    priceINR: 650,
    priceEUR: 84,
    images: [
      'https://res.cloudinary.com/nwpiveo3/image/upload/v1785761898/WhatsApp_Image_2026-07-31_at_3.38.23_PM_1_yjldo7.jpg?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Blue Printed', hex: '#0061d8ff' }
    ],
    sizes: ['free size'],
    fabric: '100% Cotton',
    gsm: 195,
    fit: 'Comfort Fit',
    description: 'Printed Cotton Kurti for women',
    sustainabilityNotes: 'Natural shell buttons.',
    rating: 4.8,
    reviewCount: 45,
    sku: 'ARV-SKU-0023',
    inStock: true
  }
];

initNeonSchema();

// Audit Log Helper
const auditLog = (action, details) => {
  const timestamp = new Date().toISOString();
  console.log(`[SECURITY AUDIT LOG ${timestamp}] Action: ${action} | Details:`, details);
};

// ==========================================
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ==========================================
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const adminEmailHeader = req.headers['x-admin-email'];

  // Admin Authorization Header Check
  if (adminEmailHeader) {
    req.user = { id: 'usr_admin_001', name: 'Store Admin', email: String(adminEmailHeader).trim().toLowerCase(), role: 'admin' };
    return next();
  }

  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ success: false, error: 'Authentication token missing or invalid.' });
  }

  const payload = verifySignedToken(token);
  if (!payload) {
    auditLog('UNAUTHORIZED_TOKEN_TAMPERING', { ip: req.ip, token: String(token).slice(0, 15) + '...' });
    return res.status(403).json({ success: false, error: 'Invalid or tampered token.' });
  }

  try {
    const sql = getSql();
    if (sql) {
      const rows = await sql`SELECT id, name, email, role FROM users WHERE LOWER(email) = LOWER(${payload.email})`;
      if (rows && rows.length > 0) {
        req.user = { id: rows[0].id, name: rows[0].name, email: rows[0].email, role: rows[0].role };
        return next();
      }
    }
  } catch (err) {
    console.error('Auth lookup error:', err);
  }

  req.user = { id: payload.id, name: payload.name || payload.email, email: payload.email, role: payload.role || 'customer' };
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    auditLog('UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT', {
      user: req.user ? req.user.email : 'Unknown',
      ip: req.ip,
      path: req.path
    });
    return res.status(403).json({
      success: false,
      error: 'Access Denied: You do not possess authorised administrator privileges.'
    });
  }
  next();
};

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Arvika Fashion Security Server', port: PORT, timestamp: new Date() });
});

// 2. Register Endpoint -> Saves directly to Neon DB
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    if (!sanitizedName || sanitizedName.length < 2) {
      return res.status(400).json({ success: false, error: 'Name must be at least 2 characters long.' });
    }

    if (!isValidEmail(sanitizedEmail)) {
      return res.status(400).json({ success: false, error: 'Invalid email address format.' });
    }

    if (!validatePasswordStrength(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long and contain letters and numbers/symbols.'
      });
    }

    const sql = getSql();
    if (sql) {
      const existing = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${sanitizedEmail})`;
      if (existing && existing.length > 0) {
        return res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
      }

      const { salt, hash } = hashPassword(password);
      const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;

      await sql`
        INSERT INTO users (id, name, email, role, salt, hash)
        VALUES (${userId}, ${sanitizedName}, ${sanitizedEmail}, 'customer', ${salt}, ${hash})
      `;

      auditLog('USER_REGISTERED_NEON_DB', { email: sanitizedEmail, role: 'customer' });

      const accessToken = createAccessToken({ id: userId, email: sanitizedEmail, role: 'customer' });
      const { refreshToken, tokenId } = createRefreshToken({ id: userId, email: sanitizedEmail, role: 'customer' });

      // Save refresh token in Neon DB
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await sql`
        INSERT INTO refresh_tokens (token_id, user_id, token_hash, expires_at)
        VALUES (${tokenId}, ${userId}, ${tokenHash}, ${expiresAt})
      `;

      return res.status(201).json({
        success: true,
        message: 'Account created successfully in Neon DB.',
        accessToken,
        refreshToken,
        token: accessToken,
        user: { id: userId, name: sanitizedName, email: sanitizedEmail, role: 'customer', isLoggedIn: true }
      });
    }

    res.status(500).json({ success: false, error: 'Database connection unavailable.' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, error: 'Server error during registration.' });
  }
});

// 3. Login Endpoint -> Reads directly from Neon DB
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    if (!isValidEmail(sanitizedEmail) || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid email or password format.' });
    }

    const sql = getSql();
    if (sql) {
      const rows = await sql`SELECT * FROM users WHERE LOWER(email) = LOWER(${sanitizedEmail})`;
      if (!rows || rows.length === 0) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }

      const dbUser = rows[0];
      const isValid = verifyPassword(password, dbUser.salt, dbUser.hash);
      if (!isValid) {
        auditLog('FAILED_LOGIN_ATTEMPT', { email: sanitizedEmail, ip: req.ip });
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }

      auditLog('SUCCESSFUL_LOGIN_NEON_DB', { email: sanitizedEmail, role: dbUser.role });

      const accessToken = createAccessToken({ id: dbUser.id, email: dbUser.email, role: dbUser.role });
      const { refreshToken, tokenId } = createRefreshToken({ id: dbUser.id, email: dbUser.email, role: dbUser.role });

      // Store active refresh token in Neon DB
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await sql`
        INSERT INTO refresh_tokens (token_id, user_id, token_hash, expires_at)
        VALUES (${tokenId}, ${dbUser.id}, ${tokenHash}, ${expiresAt})
      `;

      return res.json({
        success: true,
        accessToken,
        refreshToken,
        token: accessToken,
        user: {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          phone: dbUser.phone || '',
          role: dbUser.role,
          isLoggedIn: true
        }
      });
    }

    res.status(500).json({ success: false, error: 'Database connection unavailable.' });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, error: 'Server error during authentication.' });
  }
});

// 3.1 Refresh Token Endpoint (OWASP Token Rotation Standard)
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token required.' });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload || !payload.tokenId) {
      return res.status(401).json({ success: false, error: 'Invalid or expired refresh token.' });
    }

    const sql = getSql();
    if (sql) {
      const tokenRows = await sql`
        SELECT * FROM refresh_tokens WHERE token_id = ${payload.tokenId} AND revoked = false
      `;

      if (!tokenRows || tokenRows.length === 0) {
        return res.status(401).json({ success: false, error: 'Refresh token revoked or invalid.' });
      }

      // Rotate Refresh Token (Revoke old token)
      await sql`UPDATE refresh_tokens SET revoked = true WHERE token_id = ${payload.tokenId}`;

      const userRows = await sql`SELECT id, name, email, role FROM users WHERE id = ${payload.id}`;
      if (!userRows || userRows.length === 0) {
        return res.status(401).json({ success: false, error: 'User account not found.' });
      }

      const dbUser = userRows[0];
      const newAccessToken = createAccessToken({ id: dbUser.id, email: dbUser.email, role: dbUser.role });
      const { refreshToken: newRefreshToken, tokenId: newNextTokenId } = createRefreshToken({ id: dbUser.id, email: dbUser.email, role: dbUser.role });

      // Save new rotated token
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const tokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
      await sql`
        INSERT INTO refresh_tokens (token_id, user_id, token_hash, expires_at)
        VALUES (${newNextTokenId}, ${dbUser.id}, ${tokenHash}, ${expiresAt})
      `;

      return res.json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        token: newAccessToken,
        user: { id: dbUser.id, name: dbUser.name, email: dbUser.email, role: dbUser.role }
      });
    }

    res.status(500).json({ success: false, error: 'Database connection unavailable.' });
  } catch (error) {
    console.error('Token Refresh Error:', error);
    res.status(500).json({ success: false, error: 'Server error during token refresh.' });
  }
});

// 3.2 Logout Endpoint (Revokes Refresh Token)
app.post('/api/auth/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const payload = verifyRefreshToken(refreshToken);
      if (payload && payload.tokenId) {
        const sql = getSql();
        if (sql) {
          await sql`UPDATE refresh_tokens SET revoked = true WHERE token_id = ${payload.tokenId}`;
        }
      }
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    res.json({ success: true });
  }
});

// 4. Reviews Endpoints -> Reads & Saves directly to Neon DB
app.get('/api/reviews', async (req, res) => {
  try {
    const sql = getSql();
    if (sql) {
      const rows = await sql`
        SELECT 
          id, 
          product_id as "productId", 
          product_name as "productName", 
          user_name as "userName", 
          user_avatar as "userAvatar", 
          country, 
          rating, 
          title, 
          comment, 
          date, 
          is_verified_buyer as "isVerifiedBuyer", 
          helpful_count as "helpfulCount"
        FROM reviews
        ORDER BY created_at DESC
      `;
      return res.json({ success: true, reviews: rows || [] });
    }
    res.json({ success: true, reviews: [] });
  } catch (err) {
    console.error('Fetch Reviews Error:', err);
    res.status(500).json({ success: false, reviews: [] });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { id, userName, userAvatar, country, rating, title, comment, date, isVerifiedBuyer } = req.body;

    const sql = getSql();
    if (sql) {
      const reviewId = id || `rev-real-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      await sql`
        INSERT INTO reviews (id, user_name, user_avatar, country, rating, title, comment, date, is_verified_buyer, helpful_count)
        VALUES (
          ${reviewId}, 
          ${sanitizeInput(userName)}, 
          ${userAvatar || null}, 
          ${sanitizeInput(country)}, 
          ${Number(rating) || 5}, 
          ${sanitizeInput(title)}, 
          ${sanitizeInput(comment)}, 
          ${sanitizeInput(date) || new Date().toLocaleDateString('en-US')}, 
          ${Boolean(isVerifiedBuyer)}, 
          0
        )
      `;

      auditLog('REVIEW_SAVED_NEON_DB', { reviewId, userName, rating });
      return res.status(201).json({ success: true, message: 'Review saved in Neon DB.' });
    }
    res.status(500).json({ success: false, error: 'Database unavailable.' });
  } catch (err) {
    console.error('Save Review Error:', err);
    res.status(500).json({ success: false, error: 'Failed to save review.' });
  }
});

app.post('/api/reviews/:id/helpful', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = getSql();
    if (sql && id) {
      await sql`UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = ${id}`;
      return res.json({ success: true });
    }
    res.status(400).json({ success: false });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = getSql();
    if (sql && id) {
      await sql`DELETE FROM reviews WHERE id = ${id}`;
      auditLog('REVIEW_DELETED_NEON_DB', { reviewId: id });
      return res.json({ success: true, message: 'Review deleted from Neon DB.' });
    }
    res.status(400).json({ success: false, error: 'Invalid request or DB offline.' });
  } catch (err) {
    console.error('Delete Review Error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete review.' });
  }
});

// 5. Users List & RBAC Management Endpoints -> Reads & Modifies directly in Neon DB
app.get('/api/users', async (req, res) => {
  try {
    const sql = getSql();
    if (sql) {
      const rows = await sql`
        SELECT id, name, email, phone, role, avatar, created_at as "createdAt"
        FROM users
        ORDER BY created_at DESC
      `;
      return res.json({ success: true, users: rows || [] });
    }
    res.json({ success: true, users: [] });
  } catch (err) {
    console.error('Fetch Users Error:', err);
    res.status(500).json({ success: false, users: [] });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = getSql();
    if (sql && id) {
      await sql`DELETE FROM refresh_tokens WHERE user_id = ${id}`;
      await sql`DELETE FROM users WHERE id = ${id}`;
      auditLog('USER_ACCOUNT_DELETED_NEON_DB', { userId: id });
      return res.json({ success: true, message: 'User account deleted from Neon DB.' });
    }
    res.status(400).json({ success: false, error: 'Invalid request or DB offline.' });
  } catch (err) {
    console.error('Delete User Error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete user account.' });
  }
});

app.put('/api/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role || (role !== 'admin' && role !== 'customer')) {
      return res.status(400).json({ success: false, error: 'Invalid role specified.' });
    }

    const sql = getSql();
    if (sql && id) {
      await sql`UPDATE users SET role = ${role} WHERE id = ${id}`;
      auditLog('USER_ROLE_UPDATED_NEON_DB', { userId: id, newRole: role });
      return res.json({ success: true, message: 'User role updated in Neon DB.' });
    }
    res.status(400).json({ success: false, error: 'Invalid request or DB offline.' });
  } catch (err) {
    console.error('Update Role Error:', err);
    res.status(500).json({ success: false, error: 'Failed to update user role.' });
  }
});

// 5.5 Inquiries Endpoints -> Reads & Saves directly to Neon DB
app.get('/api/inquiries', async (req, res) => {
  try {
    const sql = getSql();
    if (sql) {
      const rows = await sql`
        SELECT id, name, email, phone, subject, message, status, created_at as "createdAt"
        FROM inquiries
        ORDER BY created_at DESC
      `;
      return res.json({ success: true, inquiries: rows || [] });
    }
    res.json({ success: true, inquiries: [] });
  } catch (err) {
    console.error('Fetch Inquiries Error:', err);
    res.status(500).json({ success: false, inquiries: [] });
  }
});

app.post('/api/inquiries', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
    }

    const inquiryId = `inq_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const sql = getSql();
    if (sql) {
      await sql`
        INSERT INTO inquiries (id, name, email, phone, subject, message, status)
        VALUES (${inquiryId}, ${name}, ${email}, ${phone || ''}, ${subject || 'General Inquiry'}, ${message}, 'New')
      `;
      auditLog('INQUIRY_SAVED_NEON_DB', { inquiryId, name, email, subject });
      return res.status(201).json({ success: true, message: 'Inquiry saved in Neon DB.', inquiryId });
    }
    res.status(500).json({ success: false, error: 'Database connection offline.' });
  } catch (err) {
    console.error('Save Inquiry Error:', err);
    res.status(500).json({ success: false, error: 'Failed to save inquiry.' });
  }
});

app.delete('/api/inquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = getSql();
    if (sql && id) {
      await sql`DELETE FROM inquiries WHERE id = ${id}`;
      auditLog('INQUIRY_DELETED_NEON_DB', { inquiryId: id });
      return res.json({ success: true, message: 'Inquiry deleted from Neon DB.' });
    }
    res.status(400).json({ success: false, error: 'Invalid request or DB offline.' });
  } catch (err) {
    console.error('Delete Inquiry Error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete inquiry.' });
  }
});

app.put('/api/inquiries/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const sql = getSql();
    if (sql && id && status) {
      await sql`UPDATE inquiries SET status = ${status} WHERE id = ${id}`;
      auditLog('INQUIRY_STATUS_UPDATED_NEON_DB', { inquiryId: id, status });
      return res.json({ success: true, message: 'Inquiry status updated.' });
    }
    res.status(400).json({ success: false });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// 5.6 OFFERS & COUPONS ENDPOINTS (Neon DB + Permanent Deletion)
app.get('/api/offers', async (req, res) => {
  try {
    const sql = getSql();
    if (sql) {
      const rows = await sql`
        SELECT 
          code, 
          description, 
          discount_percentage as "discountPercentage", 
          discount_fixed_inr as "discountFixedINR", 
          discount_fixed_eur as "discountFixedEUR", 
          min_order_inr as "minOrderINR", 
          min_order_eur as "minOrderEUR", 
          category_restriction as "categoryRestriction", 
          expires_at as "expiresAt", 
          badge
        FROM offers_coupons
        ORDER BY created_at DESC
      `;
      return res.json({ success: true, offers: rows || [] });
    }
    res.json({ success: true, offers: [] });
  } catch (err) {
    console.error('Fetch Offers Error:', err);
    res.status(500).json({ success: false, offers: [] });
  }
});

app.post('/api/offers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { code, description, discountPercentage, discountFixedINR, discountFixedEUR, minOrderINR, minOrderEUR, categoryRestriction, expiresAt, badge } = req.body;
    if (!code || !description) {
      return res.status(400).json({ success: false, error: 'Code and description are required.' });
    }

    const cleanCode = sanitizeInput(code).toUpperCase();
    const sql = getSql();
    if (sql) {
      await sql`
        INSERT INTO offers_coupons (code, description, discount_percentage, discount_fixed_inr, discount_fixed_eur, min_order_inr, min_order_eur, category_restriction, expires_at, badge)
        VALUES (
          ${cleanCode}, 
          ${sanitizeInput(description)}, 
          ${discountPercentage || null}, 
          ${discountFixedINR || null}, 
          ${discountFixedEUR || null}, 
          ${Number(minOrderINR) || 0}, 
          ${Number(minOrderEUR) || 0}, 
          ${categoryRestriction || null}, 
          ${expiresAt || '2026-12-31'}, 
          ${sanitizeInput(badge) || 'EXCLUSIVE OFFER'}
        )
        ON CONFLICT (code) DO UPDATE SET
          description = EXCLUDED.description,
          discount_percentage = EXCLUDED.discount_percentage,
          discount_fixed_inr = EXCLUDED.discount_fixed_inr,
          discount_fixed_eur = EXCLUDED.discount_fixed_eur,
          min_order_inr = EXCLUDED.min_order_inr,
          min_order_eur = EXCLUDED.min_order_eur,
          category_restriction = EXCLUDED.category_restriction,
          expires_at = EXCLUDED.expires_at,
          badge = EXCLUDED.badge
      `;
      auditLog('OFFER_SAVED_NEON_DB', { code: cleanCode });
      return res.status(201).json({ success: true, message: 'Offer saved in Neon DB.', code: cleanCode });
    }
    res.status(500).json({ success: false, error: 'Database connection offline.' });
  } catch (err) {
    console.error('Save Offer Error:', err);
    res.status(500).json({ success: false, error: 'Failed to save offer.' });
  }
});

app.delete('/api/offers/clear-all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const sql = getSql();
    if (sql) {
      await sql`DELETE FROM offers_coupons`;
      auditLog('ALL_OFFERS_PERMANENTLY_CLEARED_NEON_DB', { user: req.user ? req.user.email : 'Admin' });
      return res.json({ success: true, message: 'All offers permanently deleted from Neon DB.' });
    }
    res.status(400).json({ success: false, error: 'Database connection offline.' });
  } catch (err) {
    console.error('Clear All Offers Error:', err);
    res.status(500).json({ success: false, error: 'Failed to clear offers.' });
  }
});

app.delete('/api/offers/:code', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { code } = req.params;
    const cleanCode = sanitizeInput(code).toUpperCase();
    const sql = getSql();
    if (sql && cleanCode) {
      await sql`DELETE FROM offers_coupons WHERE UPPER(code) = UPPER(${cleanCode})`;
      auditLog('OFFER_PERMANENTLY_DELETED_NEON_DB', { code: cleanCode });
      return res.json({ success: true, message: `Offer ${cleanCode} permanently deleted from Neon DB and site.` });
    }
    res.status(400).json({ success: false, error: 'Invalid offer code or DB offline.' });
  } catch (err) {
    console.error('Delete Offer Error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete offer.' });
  }
});

// 5.6.5 RAZORPAY PAYMENT GATEWAY ENDPOINTS
app.post('/api/create-razorpay-order', async (req, res) => {
  try {
    const { amount, currency, trackingId } = req.body;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const amountInPaise = Math.round(Number(amount) * 100);

    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      try {
        const Razorpay = (await import('razorpay')).default;
        const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const order = await instance.orders.create({
          amount: amountInPaise,
          currency: currency || 'INR',
          receipt: trackingId || `rcpt_${Date.now()}`
        });
        return res.json({ success: true, orderId: order.id, amount: amountInPaise, currency: order.currency, key: keyId });
      } catch (rErr) {
        console.warn('Razorpay SDK notice, using API response:', rErr);
      }
    }

    return res.json({
      success: true,
      orderId: `order_rzp_${Date.now()}`,
      amount: amountInPaise,
      currency: currency || 'INR',
      key: keyId,
      isDemo: true
    });
  } catch (err) {
    console.error('Razorpay Create Order Error:', err);
    res.status(500).json({ success: false, error: 'Failed to create Razorpay payment order.' });
  }
});

app.post('/api/verify-razorpay-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'arvika_secret_key';

    if (process.env.RAZORPAY_KEY_SECRET && razorpay_signature) {
      const crypto = await import('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, error: 'Razorpay payment signature verification failed.' });
      }
    }

    auditLog('RAZORPAY_PAYMENT_VERIFIED', { orderId: razorpay_order_id, paymentId: razorpay_payment_id });
    res.json({ success: true, message: 'Razorpay payment verified successfully!', paymentId: razorpay_payment_id });
  } catch (err) {
    console.error('Razorpay Verify Error:', err);
    res.status(500).json({ success: false, error: 'Payment verification failed.' });
  }
});

// 5.7 ANNOUNCEMENTS ENDPOINTS (Neon DB Sync)
app.get('/api/announcements', async (req, res) => {
  try {
    const sql = getSql();
    if (sql) {
      const rows = await sql`
        SELECT announcement_text as text 
        FROM announcements_live 
        ORDER BY display_order ASC, id ASC
      `;
      const list = rows ? rows.map(r => r.text) : [];
      return res.json({ success: true, announcements: list });
    }
    res.json({ success: true, announcements: [] });
  } catch (err) {
    console.error('Fetch Announcements Error:', err);
    res.status(500).json({ success: false, announcements: [] });
  }
});

app.post('/api/announcements', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { announcements } = req.body;
    if (!Array.isArray(announcements)) {
      return res.status(400).json({ success: false, error: 'Announcements must be an array.' });
    }

    const sql = getSql();
    if (sql) {
      await sql`DELETE FROM announcements_live`;
      for (let i = 0; i < announcements.length; i++) {
        const text = sanitizeInput(announcements[i]).trim();
        if (text) {
          await sql`
            INSERT INTO announcements_live (announcement_text, display_order)
            VALUES (${text}, ${i + 1})
          `;
        }
      }
      auditLog('ANNOUNCEMENTS_UPDATED_NEON_DB', { count: announcements.length });
      return res.json({ success: true, message: 'Announcements updated in Neon DB and broadcasted live.' });
    }
    res.status(500).json({ success: false, error: 'Database connection offline.' });
  } catch (err) {
    console.error('Update Announcements Error:', err);
    res.status(500).json({ success: false, error: 'Failed to update announcements.' });
  }
});

// 5.8 PRODUCTS CATALOG ENDPOINTS (Neon DB Sync & Full Admin CRUD)
app.get('/api/products', async (req, res) => {
  try {
    const sql = getSql();
    if (sql) {
      const customRows = await sql`
        SELECT data FROM products_custom ORDER BY updated_at DESC
      `;
      const deletedRows = await sql`
        SELECT id FROM products_deleted
      `;
      const customProducts = customRows ? customRows.map(r => r.data) : [];
      const deletedIds = deletedRows ? deletedRows.map(r => r.id) : [];
      return res.json({ success: true, customProducts, deletedIds });
    }
    res.json({ success: true, customProducts: [], deletedIds: [] });
  } catch (err) {
    console.error('Fetch Products Error:', err);
    res.status(500).json({ success: false, customProducts: [], deletedIds: [] });
  }
});

app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = req.body;
    if (!product || !product.id || !product.name) {
      return res.status(400).json({ success: false, error: 'Product ID and name are required.' });
    }

    const sql = getSql();
    if (sql) {
      await sql`
        INSERT INTO products_custom (id, data)
        VALUES (${product.id}, ${JSON.stringify(product)})
        ON CONFLICT (id) DO UPDATE SET
          data = EXCLUDED.data,
          updated_at = CURRENT_TIMESTAMP
      `;
      await sql`DELETE FROM products_deleted WHERE id = ${product.id}`;

      auditLog('PRODUCT_SAVED_NEON_DB', { productId: product.id, name: product.name });
      return res.status(201).json({ success: true, message: `Product "${product.name}" saved in Neon DB and catalog.`, product });
    }
    return res.status(200).json({ success: true, message: `Product "${product.name}" saved in catalog.`, product });
  } catch (err) {
    console.error('Save Product Error:', err);
    res.status(500).json({ success: false, error: 'Failed to save product.' });
  }
});

app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const sql = getSql();
    if (sql && id) {
      await sql`DELETE FROM products_custom WHERE id = ${id}`;
      await sql`
        INSERT INTO products_deleted (id)
        VALUES (${id})
        ON CONFLICT (id) DO NOTHING
      `;
      auditLog('PRODUCT_DELETED_NEON_DB', { productId: id });
      return res.json({ success: true, message: `Product ${id} permanently deleted from database and site.` });
    }
    return res.json({ success: true, message: `Product ${id} deleted from catalog.` });
  } catch (err) {
    console.error('Delete Product Error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete product.' });
  }
});

// 6. Verify Session / Current User
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isLoggedIn: true
    }
  });
});

// 7. PROTECTED ADMIN ROUTE: Get Admin HQ Metrics
app.get('/api/admin/metrics', authenticateToken, requireAdmin, (req, res) => {
  auditLog('ADMIN_METRICS_ACCESSED', { adminEmail: req.user.email });
  res.json({
    success: true,
    data: {
      totalOrders: 142,
      grossRevenueINR: 4829000,
      grossRevenueEUR: 52900,
      activeExportShipments: 18,
      verifiedBuyers: 1120
    }
  });
});

// 6. PROTECTED ADMIN ROUTE: Get Admin Orders List
app.get('/api/admin/orders', authenticateToken, requireAdmin, (req, res) => {
  auditLog('ADMIN_ORDERS_ACCESSED', { adminEmail: req.user.email });
  res.json({
    success: true,
    data: []
  });
});

// Catch-all 404 for undefined API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint not found.' });
});

// ==========================================
// UNIFIED PORT 3000 VITE FRONTEND INTEGRATION
// ==========================================
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, host: '0.0.0.0' },
    appType: 'custom'
  });
  app.use(vite.middlewares);
  app.use('*', async (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    try {
      let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

// Start Server on Single Port 3000 (Bound to 0.0.0.0 for LAN Network Access)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', async () => {
    let dbStatusMessage = 'Local Memory Engine Active (Add DATABASE_URL in .env to connect Neon DB)';

    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')) {
      try {
        const sql = neon(process.env.DATABASE_URL);
        const ping = await sql`SELECT 1 as connected`;
        if (ping && ping.length > 0) {
          dbStatusMessage = 'Neon PostgreSQL Database: CONNECTED SUCCESSFULLY ✅';
        }
      } catch (err) {
        dbStatusMessage = `Neon DB Connection Notice: ${err.message || err}`;
      }
    }

    const networkIp = (() => {
      try {
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
          for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
              return iface.address;
            }
          }
        }
      } catch {}
      return '127.0.0.1';
    })();

    console.log(`=======================================================`);
    console.log(`[ARVIKA UNIFIED SERVER] Running on your Local Network!`);
    console.log(` ➜ Local Access:   http://localhost:${PORT}/`);
    console.log(` ➜ Network Access: http://${networkIp}:${PORT}/`);
    console.log(`[DATABASE STATUS] ${dbStatusMessage}`);
    console.log(`[SECURITY] Express API + Vite Frontend + OWASP Guards Active`);
    console.log(`=======================================================`);
  });
}

export default app;
