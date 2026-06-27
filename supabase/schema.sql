-- ============================================================
--  MUFASA Gadgets & Accessories — Supabase Schema
--  Project : ozfnsirllueuwvsrhycf  (PostgreSQL 17)
--  Note    : This project is shared with the vPay delivery app.
--            All shop tables are prefixed shop_ to avoid conflicts.
--            The existing profiles, products, orders tables belong
--            to vPay and must NOT be modified here.
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── Categories (shared, our schema was applied first) ────────
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
  ('Smartphones',  'smartphones',  'Latest mobile devices and smartphones', 1),
  ('Audio',        'audio',        'Headphones, speakers, earbuds',         2),
  ('Wearables',    'wearables',    'Smartwatches, fitness trackers, AR/VR', 3),
  ('Accessories',  'accessories',  'Cables, cases, stands, and more',       4),
  ('Laptops',      'laptops',      'Premium laptops and ultrabooks',        5),
  ('Cameras',      'cameras',      'Digital cameras, action cams, drones',  6)
ON CONFLICT (slug) DO NOTHING;

-- ── Updated-at helper (safe to re-run) ──────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $func$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$func$;

-- ── handle_new_user trigger (compatible with shared profiles) ─
-- Inserts into existing profiles table (name + role NOT NULL).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $func$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── shop_products ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_products (
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

CREATE INDEX IF NOT EXISTS idx_shop_products_slug      ON public.shop_products(slug);
CREATE INDEX IF NOT EXISTS idx_shop_products_category  ON public.shop_products(category_id);
CREATE INDEX IF NOT EXISTS idx_shop_products_featured  ON public.shop_products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_shop_products_active    ON public.shop_products(is_active)   WHERE is_active   = true;
CREATE INDEX IF NOT EXISTS idx_shop_products_name_trgm ON public.shop_products USING gin(name gin_trgm_ops);

ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active shop_products" ON public.shop_products;
CREATE POLICY "Public read active shop_products" ON public.shop_products FOR SELECT USING (is_active = true);

DROP TRIGGER IF EXISTS set_shop_products_updated_at ON public.shop_products;
CREATE TRIGGER set_shop_products_updated_at
  BEFORE UPDATE ON public.shop_products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── shop_product_images ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_product_images (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  uuid NOT NULL REFERENCES public.shop_products(id) ON DELETE CASCADE,
  url         text NOT NULL,
  alt         text,
  is_primary  boolean DEFAULT false,
  sort_order  int     DEFAULT 0,
  created_at  timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shop_product_images_product ON public.shop_product_images(product_id);
ALTER TABLE public.shop_product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read shop_product_images" ON public.shop_product_images;
CREATE POLICY "Public read shop_product_images" ON public.shop_product_images FOR SELECT USING (true);

-- ── shop_orders ───────────────────────────────────────────────
-- Uses text + CHECK instead of enum types (compatible with PG17 without IF NOT EXISTS on types)
CREATE TABLE IF NOT EXISTS public.shop_orders (
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

CREATE INDEX IF NOT EXISTS idx_shop_orders_user   ON public.shop_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_email  ON public.shop_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON public.shop_orders(status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_stripe ON public.shop_orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_paynow ON public.shop_orders(paynow_reference);

ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own shop_orders" ON public.shop_orders;
CREATE POLICY "Users view own shop_orders" ON public.shop_orders
  FOR SELECT USING (
    auth.uid() = user_id
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
DROP POLICY IF EXISTS "Anyone can create shop_order" ON public.shop_orders;
CREATE POLICY "Anyone can create shop_order" ON public.shop_orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Service role updates shop_orders" ON public.shop_orders;
CREATE POLICY "Service role updates shop_orders" ON public.shop_orders
  FOR UPDATE USING (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS set_shop_orders_updated_at ON public.shop_orders;
CREATE TRIGGER set_shop_orders_updated_at
  BEFORE UPDATE ON public.shop_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── shop_order_items ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_order_items (
  id            uuid         PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      uuid         NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  product_id    uuid         REFERENCES public.shop_products(id) ON DELETE SET NULL,
  product_name  text         NOT NULL,
  product_image text,
  price         numeric(10,2) NOT NULL CHECK (price >= 0),
  quantity      int          NOT NULL CHECK (quantity > 0),
  subtotal      numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  created_at    timestamptz  DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shop_order_items_order ON public.shop_order_items(order_id);
ALTER TABLE public.shop_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own order items" ON public.shop_order_items;
CREATE POLICY "Users view own order items" ON public.shop_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shop_orders o WHERE o.id = order_id
      AND (o.user_id = auth.uid()
        OR o.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.shop_order_items;
CREATE POLICY "Anyone can insert order items" ON public.shop_order_items FOR INSERT WITH CHECK (true);

-- ── Storage buckets (run once in Supabase dashboard) ─────────
-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('shop-product-images', 'shop-product-images', true),
--   ('shop-banners',        'shop-banners',         true)
-- ON CONFLICT DO NOTHING;
