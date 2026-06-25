-- ============================================================
--  MUFASA Gadgets & Accessories — Supabase Schema
--  Project: ozfnsirllueuwvsrhycf
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";  -- for fuzzy search

-- ── Profiles ─────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on sign up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Categories ───────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  sort_order  int  default 0,
  created_at  timestamptz default now() not null
);

alter table public.categories enable row level security;
create policy "Public read categories" on public.categories
  for select using (true);

-- Seed categories
insert into public.categories (name, slug, description, sort_order) values
  ('Smartphones',  'smartphones',  'Latest mobile devices and smartphones',    1),
  ('Audio',        'audio',        'Headphones, speakers, earbuds',            2),
  ('Wearables',    'wearables',    'Smartwatches, fitness trackers, AR/VR',    3),
  ('Accessories',  'accessories',  'Cables, cases, stands, and more',          4),
  ('Laptops',      'laptops',      'Premium laptops and ultrabooks',           5),
  ('Cameras',      'cameras',      'Digital cameras, action cams, drones',     6)
on conflict (slug) do nothing;

-- ── Products ─────────────────────────────────────────────────
create table if not exists public.products (
  id                uuid primary key default uuid_generate_v4(),
  name              text      not null,
  slug              text      not null unique,
  description       text      not null default '',
  short_description text,
  price             numeric(10,2) not null check (price >= 0),
  compare_at_price  numeric(10,2) check (compare_at_price >= 0),
  category_id       uuid references public.categories(id) on delete set null,
  stock_quantity    int       not null default 0 check (stock_quantity >= 0),
  is_featured       boolean   not null default false,
  is_active         boolean   not null default true,
  tags              text[]    default '{}',
  specs             jsonb,
  created_at        timestamptz default now() not null,
  updated_at        timestamptz default now() not null
);

create index if not exists idx_products_slug       on public.products(slug);
create index if not exists idx_products_category   on public.products(category_id);
create index if not exists idx_products_featured   on public.products(is_featured) where is_featured = true;
create index if not exists idx_products_active     on public.products(is_active)   where is_active   = true;
create index if not exists idx_products_name_trgm  on public.products using gin(name gin_trgm_ops);

alter table public.products enable row level security;
create policy "Public read active products" on public.products
  for select using (is_active = true);
create policy "Admin full access products" on public.products
  using (auth.role() = 'service_role');

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ── Product Images ───────────────────────────────────────────
create table if not exists public.product_images (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  url         text not null,
  alt         text,
  is_primary  boolean default false,
  sort_order  int     default 0,
  created_at  timestamptz default now() not null
);

create index if not exists idx_product_images_product on public.product_images(product_id);

alter table public.product_images enable row level security;
create policy "Public read product images" on public.product_images
  for select using (true);

-- ── Orders ───────────────────────────────────────────────────
create type if not exists public.order_status as enum (
  'pending', 'awaiting_payment', 'paid', 'processing',
  'shipped', 'delivered', 'cancelled', 'refunded', 'failed'
);
create type if not exists public.payment_method as enum ('stripe', 'paynow');
create type if not exists public.payment_status as enum (
  'pending', 'completed', 'failed', 'cancelled', 'refunded'
);

create table if not exists public.orders (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references auth.users(id) on delete set null,
  customer_email    text      not null,
  customer_name     text      not null,
  customer_phone    text,
  status            public.order_status    not null default 'pending',
  payment_method    public.payment_method,
  payment_status    public.payment_status  not null default 'pending',
  payment_reference text,
  stripe_session_id text,
  paynow_reference  text,
  subtotal          numeric(10,2) not null check (subtotal >= 0),
  shipping_cost     numeric(10,2) not null default 0 check (shipping_cost >= 0),
  total             numeric(10,2) not null check (total >= 0),
  shipping_address  jsonb,
  notes             text,
  created_at        timestamptz default now() not null,
  updated_at        timestamptz default now() not null
);

create index if not exists idx_orders_user           on public.orders(user_id);
create index if not exists idx_orders_email          on public.orders(customer_email);
create index if not exists idx_orders_status         on public.orders(status);
create index if not exists idx_orders_stripe_session on public.orders(stripe_session_id);
create index if not exists idx_orders_paynow_ref     on public.orders(paynow_reference);

alter table public.orders enable row level security;

-- Customers can view their own orders (by email match or user_id)
create policy "Users view own orders" on public.orders
  for select using (
    auth.uid() = user_id
    or customer_email = (select email from auth.users where id = auth.uid())
  );
-- Anyone can insert (guest checkout supported)
create policy "Anyone can create order" on public.orders
  for insert with check (true);
-- Only service role can update (webhooks use service role client)
create policy "Service role can update orders" on public.orders
  for update using (auth.role() = 'service_role');

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ── Order Items ──────────────────────────────────────────────
create table if not exists public.order_items (
  id            uuid primary key default uuid_generate_v4(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  product_name  text not null,
  product_image text,
  price         numeric(10,2) not null check (price >= 0),
  quantity      int  not null  check (quantity > 0),
  subtotal      numeric(10,2) not null check (subtotal >= 0),
  created_at    timestamptz default now() not null
);

create index if not exists idx_order_items_order on public.order_items(order_id);

alter table public.order_items enable row level security;
create policy "Users view own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
      and (o.user_id = auth.uid()
        or o.customer_email = (select email from auth.users where id = auth.uid()))
    )
  );
create policy "Anyone can insert order items" on public.order_items
  for insert with check (true);

-- ============================================================
--  Storage Buckets (run in Supabase dashboard SQL editor)
-- ============================================================
-- insert into storage.buckets (id, name, public) values
--   ('product-images', 'product-images', true),
--   ('payment-banners', 'payment-banners', true)
-- on conflict do nothing;
