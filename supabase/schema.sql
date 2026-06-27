-- ============================================================
--  MUFASA Gadgets & Accessories — Supabase Schema
--  Project : ozfnsirllueuwvsrhycf  (PostgreSQL 17)
--  GitHub  : Munyah17/MufasaShop
--  This is a DEDICATED Supabase project for Mufasa Shop only.
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── Utility: auto-update updated_at ──────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $func$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$func$;

-- ── Profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  full_name   text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $func$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Categories ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text,
  image_url   text,
  sort_order  int  DEFAULT 0,
  created_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Smartphones', 'smartphones', 'Latest mobile devices and smartphones', 1),
  ('Audio',       'audio',       'Headphones, speakers, earbuds',         2),
  ('Wearables',   'wearables',   'Smartwatches, fitness trackers, AR/VR', 3),
  ('Accessories', 'accessories', 'Cables, cases, stands, and more',       4),
  ('Laptops',     'laptops',     'Premium laptops and ultrabooks',        5),
  ('Cameras',     'cameras',     'Digital cameras, action cams, drones',  6)
ON CONFLICT (slug) DO NOTHING;

-- ── Products ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id                uuid         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              text         NOT NULL,
  slug              text         NOT NULL UNIQUE,
  description       text         NOT NULL DEFAULT '',
  short_description text,
  price             numeric(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price  numeric(10,2) CHECK (compare_at_price >= 0),
  category_id       uuid         REFERENCES public.categories(id) ON DELETE SET NULL,
  stock_quantity    int          NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_featured       boolean      NOT NULL DEFAULT false,
  is_active         boolean      NOT NULL DEFAULT true,
  tags              text[]       DEFAULT '{}',
  specs             jsonb,
  created_at        timestamptz  DEFAULT now() NOT NULL,
  updated_at        timestamptz  DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_slug      ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category  ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured  ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active    ON public.products(is_active)   WHERE is_active   = true;
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin(name gin_trgm_ops);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active products" ON public.products;
CREATE POLICY "Public read active products" ON public.products FOR SELECT USING (is_active = true);

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Product Images ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_images (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url         text NOT NULL,
  alt         text,
  is_primary  boolean DEFAULT false,
  sort_order  int     DEFAULT 0,
  created_at  timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read product_images" ON public.product_images;
CREATE POLICY "Public read product_images" ON public.product_images FOR SELECT USING (true);

-- ── Orders ───────────────────────────────────────────────────
-- Uses text + CHECK (PostgreSQL 17 does not support CREATE TYPE IF NOT EXISTS for enums)
CREATE TABLE IF NOT EXISTS public.orders (
  id                uuid         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           uuid         REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email    text         NOT NULL,
  customer_name     text         NOT NULL,
  customer_phone    text,
  status            text         NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending','awaiting_payment','paid','processing','shipped','delivered','cancelled','refunded','failed')),
  payment_method    text         CHECK (payment_method IN ('stripe','paynow')),
  payment_status    text         NOT NULL DEFAULT 'pending'
                                 CHECK (payment_status IN ('pending','completed','failed','cancelled','refunded')),
  payment_reference text,
  stripe_session_id text,
  paynow_reference  text,
  subtotal          numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost     numeric(10,2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  total             numeric(10,2) NOT NULL CHECK (total >= 0),
  shipping_address  jsonb,
  notes             text,
  created_at        timestamptz  DEFAULT now() NOT NULL,
  updated_at        timestamptz  DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user   ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email  ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_paynow ON public.orders(paynow_reference);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own orders"       ON public.orders;
DROP POLICY IF EXISTS "Anyone can create order"     ON public.orders;
DROP POLICY IF EXISTS "Service role updates orders" ON public.orders;
CREATE POLICY "Users view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
CREATE POLICY "Anyone can create order"
  ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role updates orders"
  ON public.orders FOR UPDATE USING (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Order Items ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id            uuid         PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      uuid         NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    uuid         REFERENCES public.products(id) ON DELETE SET NULL,
  product_name  text         NOT NULL,
  product_image text,
  price         numeric(10,2) NOT NULL CHECK (price >= 0),
  quantity      int          NOT NULL CHECK (quantity > 0),
  subtotal      numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  created_at    timestamptz  DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own order items"   ON public.order_items;
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
CREATE POLICY "Users view own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders o WHERE o.id = order_id
    AND (o.user_id = auth.uid() OR o.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  ));
CREATE POLICY "Anyone can insert order items"
  ON public.order_items FOR INSERT WITH CHECK (true);

-- ── Storage buckets ───────────────────────────────────────────
-- Run this once manually in Supabase SQL editor if buckets don't exist:
-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('product-images',   'product-images',   true),
--   ('payment-banners',  'payment-banners',   true)
-- ON CONFLICT DO NOTHING;
