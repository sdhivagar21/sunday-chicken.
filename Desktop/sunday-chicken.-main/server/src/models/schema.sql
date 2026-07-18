-- Sunday Chicken Database Schema
-- PostgreSQL (Supabase)
-- Version: 1.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL,
  phone         VARCHAR(15)  UNIQUE NOT NULL,
  email         VARCHAR(150) UNIQUE,
  password_hash TEXT        NOT NULL,
  role          VARCHAR(10)  NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── CATEGORIES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(80) NOT NULL UNIQUE,
  slug        VARCHAR(80) NOT NULL UNIQUE,
  image_url   TEXT,
  sort_order  INT         NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PRODUCTS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id     UUID        REFERENCES categories(id) ON DELETE SET NULL,
  name            VARCHAR(150) NOT NULL,
  description     TEXT,
  cost_per_kg     DECIMAL(10,2) NOT NULL,           -- Admin-only changeable base cost
  image_url       TEXT,
  image_public_id TEXT,                              -- Cloudinary public_id
  is_available    BOOLEAN     NOT NULL DEFAULT TRUE,
  is_featured     BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order      INT         NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ADDRESSES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label        VARCHAR(30) DEFAULT 'Home',
  address_line TEXT        NOT NULL,
  landmark     VARCHAR(150),
  pincode      VARCHAR(10),
  is_default   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ORDERS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number        VARCHAR(20) UNIQUE NOT NULL,
  user_id             UUID        REFERENCES users(id) ON DELETE SET NULL,
  customer_name       VARCHAR(100) NOT NULL,
  customer_phone      VARCHAR(15)  NOT NULL,
  delivery_address    TEXT        NOT NULL,
  landmark            VARCHAR(150),
  payment_method      VARCHAR(10) NOT NULL CHECK (payment_method IN ('cod','upi')),
  payment_status      VARCHAR(20) NOT NULL DEFAULT 'pending',
  status              VARCHAR(30) NOT NULL DEFAULT 'received'
                        CHECK (status IN ('received','preparing','packed','out_for_delivery','delivered','rejected')),
  subtotal            DECIMAL(10,2) NOT NULL,
  delivery_charge     DECIMAL(10,2) NOT NULL DEFAULT 30,
  total_amount        DECIMAL(10,2) NOT NULL,
  order_notes         TEXT,
  estimated_delivery  VARCHAR(50),              -- e.g. "35 Minutes"
  admin_note          TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ORDER ITEMS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id                  UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id          UUID          REFERENCES products(id) ON DELETE SET NULL,
  product_name        VARCHAR(150)  NOT NULL,       -- snapshot at time of order
  cost_per_kg         DECIMAL(10,2) NOT NULL,       -- snapshot
  weight_kg           DECIMAL(6,3)  NOT NULL,
  quantity            INT           NOT NULL DEFAULT 1,
  special_instruction TEXT,
  line_total          DECIMAL(10,2) NOT NULL,       -- (cost + profit) * qty
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── PAYMENTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id       UUID        NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  method         VARCHAR(10) NOT NULL,
  status         VARCHAR(20) NOT NULL DEFAULT 'pending',
  transaction_id VARCHAR(100),
  amount         DECIMAL(10,2) NOT NULL,
  paid_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── SETTINGS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key        VARCHAR(100) PRIMARY KEY,
  value      TEXT         NOT NULL,
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Default settings
INSERT INTO settings (key, value) VALUES
  ('delivery_charge', '30'),
  ('profit_percentage', '10'),
  ('store_status', 'open'),
  ('min_order_amount', '0')
ON CONFLICT (key) DO NOTHING;

-- ── INDEXES ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- ── AUTO-UPDATE updated_at TRIGGER ──────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated_at   BEFORE UPDATE ON orders   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
