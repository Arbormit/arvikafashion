-- ============================================================
-- ARVIKA FASHION - NEON POSTGRESQL PRODUCTION DATABASE SCHEMA
-- ============================================================
-- Execute this SQL script in your NeonDB SQL Editor (https://console.neon.tech)

-- 1. USERS TABLE
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

-- Index on email for fast authentication lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS addresses (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  street TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  is_default_shipping BOOLEAN DEFAULT FALSE,
  is_default_billing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subtitle TEXT,
  category_id VARCHAR(64) NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  price_inr NUMERIC(10, 2) NOT NULL,
  price_eur NUMERIC(10, 2) NOT NULL,
  original_price_inr NUMERIC(10, 2),
  original_price_eur NUMERIC(10, 2),
  images JSONB NOT NULL DEFAULT '[]',
  colors JSONB NOT NULL DEFAULT '[]',
  sizes JSONB NOT NULL DEFAULT '[]',
  fabric VARCHAR(255) NOT NULL,
  fit VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  sustainability_notes TEXT,
  is_trending BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT FALSE,
  is_best_seller BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  sku VARCHAR(100) UNIQUE NOT NULL,
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  order_tracking_id VARCHAR(100) UNIQUE NOT NULL,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  items JSONB NOT NULL,
  subtotal_inr NUMERIC(10, 2) NOT NULL,
  subtotal_eur NUMERIC(10, 2) NOT NULL,
  discount_inr NUMERIC(10, 2) DEFAULT 0,
  discount_eur NUMERIC(10, 2) DEFAULT 0,
  total_inr NUMERIC(10, 2) NOT NULL,
  total_eur NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_VERIFICATION',
  payment_details JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  tracking_number VARCHAR(100),
  carrier VARCHAR(100),
  estimated_delivery VARCHAR(100),
  status_history JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on order_tracking_id and customer_email
CREATE INDEX IF NOT EXISTS idx_orders_tracking_id ON orders(order_tracking_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- 5. REVIEWS TABLE
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

-- 6. INQUIRIES TABLE
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

-- ============================================================
-- INITIAL SEED DATA FOR NEON DB
-- ============================================================

-- Insert Default Admin (Password: AdminHQ2026!)
INSERT INTO users (id, name, email, phone, role, created_at)
VALUES (
  'usr_admin_001',
  'Store Admin (Arvika HQ)',
  'admin@arvikafashion.com',
  '+91 9891179374',
  'admin',
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Insert Default Customer (Password: CustomerPass123!)
INSERT INTO users (id, name, email, phone, role, created_at)
VALUES (
  'usr_freja_2026',
  'Freja Lindqvist',
  'freja.lindqvist@copenhagen.dk',
  '+45 20 12 34 56',
  'customer',
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;
