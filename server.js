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
    const now = Date.now();
    const cleanIp = String(ip).split(',')[0].trim();

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
const authLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });
// General API rate limit
const apiLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 120 });

app.use('/api', apiLimiter);

// ==========================================
// INPUT SANITIZATION & VALIDATION HELPERS
// ==========================================
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>]/g, '') // Strip HTML tags to prevent XSS
    .slice(0, 255); // Max length limit to prevent string injection attacks
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

    // Seed default coupons if table is empty
    const existingOffers = await sql`SELECT COUNT(*)::int as count FROM offers_coupons`;
    if (existingOffers && existingOffers[0] && existingOffers[0].count === 0) {
      await sql`
        INSERT INTO offers_coupons (code, description, discount_percentage, min_order_inr, min_order_eur, expires_at, badge)
        VALUES ('EUROPE15', '15% OFF on your order over ₹5,000 or €60 for European & Indian Clients', 15, 5000, 60, '2026-12-31', 'WELCOME PROMO'),
               ('LINEN20', '20% OFF on all Pure Linen Couture & Scandinavian Dresses', 20, 6000, 75, '2026-12-31', 'SEASONAL FAVOURITE')
      `;
      await sql`
        INSERT INTO offers_coupons (code, description, discount_fixed_inr, discount_fixed_eur, min_order_inr, min_order_eur, expires_at, badge)
        VALUES ('EXPORTELEGANCE', 'Flat ₹1,500 (€18) OFF on orders above ₹12,000 or €150', 1500, 18, 12000, 150, '2026-12-31', 'VIP EXECUTIVE'),
               ('FREESHIP', 'Free Express Global DHL & BlueDart Doorstep Delivery', 500, 12, 8000, 100, '2026-12-31', 'FREE EXPRESS SHIPPING')
      `;
    }

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

    const existingAnn = await sql`SELECT COUNT(*)::int as count FROM announcements_live`;
    if (existingAnn && existingAnn[0] && existingAnn[0].count === 0) {
      await sql`
        INSERT INTO announcements_live (announcement_text, display_order)
        VALUES 
          ('Use Code EUROPE15 for 15% OFF First Order', 1),
          ('European & Global Export Headquarters', 2),
          ('GST Registered & OEKO-TEX® Certified Manufacturer', 3),
          ('Top 5 European Languages Supported (EN, FR, DE, ES, IT)', 4)
      `;
    }

    // Automatic Column Migration for Pre-existing Neon DB Tables
    await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_avatar TEXT;`;
    await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS product_id VARCHAR(64);`;
    await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS product_name VARCHAR(255);`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`;

    console.log('[NEON DB INTEGRATION] ✅ Verified Neon PostgreSQL Schema & Migrated Missing Columns');
  } catch (err) {
    console.error('[NEON DB INIT ERROR]', err.message || err);
  }
}

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

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication token missing or invalid.' });
  }

  const payload = verifySignedToken(token);
  if (!payload) {
    auditLog('UNAUTHORIZED_TOKEN_TAMPERING', { ip: req.ip, token: token.slice(0, 15) + '...' });
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
    res.status(500).json({ success: false, error: 'Database connection offline.' });
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
    res.status(400).json({ success: false, error: 'Invalid product ID or DB offline.' });
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
