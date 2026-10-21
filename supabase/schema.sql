-- ============================================================================
-- RozKa: Complete PostgreSQL Schema Blueprint for Supabase
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone_number TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'hi',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------------------------
-- 2. SHOPS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone_number TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  currency_code TEXT NOT NULL DEFAULT 'INR',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------------------------
-- 3. SHOP_MEMBERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shop_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'staff')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'disabled')),
  invited_by UUID REFERENCES public.profiles(id),
  joined_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT unique_shop_user UNIQUE (shop_id, user_id)
);

-- ----------------------------------------------------------------------------
-- 4. CATEGORIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_hi TEXT,
  description TEXT,
  parent_category_id UUID REFERENCES public.categories(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------------------------
-- 5. SUPPLIERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone_number TEXT,
  whatsapp_number TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  default_lead_time_days INTEGER DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------------------------
-- 6. PRODUCTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  name_hi TEXT,
  brand TEXT,
  barcode TEXT,
  description TEXT,
  base_unit TEXT NOT NULL DEFAULT 'pkt',
  current_stock NUMERIC(14,3) NOT NULL DEFAULT 0,
  low_stock_threshold NUMERIC(14,3) NOT NULL DEFAULT 5,
  safety_stock_quantity NUMERIC(14,3) DEFAULT 2,
  supplier_lead_time_days INTEGER DEFAULT 2,
  default_supplier_id UUID REFERENCES public.suppliers(id),
  purchase_cost NUMERIC(12,2),
  selling_price NUMERIC(12,2),
  currency_code TEXT NOT NULL DEFAULT 'INR',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  archived_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1
);

-- ----------------------------------------------------------------------------
-- 7. PRODUCT_ALIASES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_aliases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  alias_name TEXT NOT NULL,
  language_code TEXT DEFAULT 'hi',
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'supplier', 'ai_confirmed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------------------------
-- 8. SUPPLIER_PRODUCTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.supplier_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  supplier_product_code TEXT,
  supplier_product_name TEXT,
  purchase_unit TEXT NOT NULL,
  base_units_per_purchase_unit NUMERIC(14,3) NOT NULL DEFAULT 1,
  minimum_order_quantity NUMERIC(14,3) DEFAULT 1,
  purchase_price NUMERIC(12,2),
  lead_time_days INTEGER,
  is_preferred BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT unique_supplier_product UNIQUE (supplier_id, product_id)
);

-- ----------------------------------------------------------------------------
-- 9. SALES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id),
  device_id UUID,
  receipt_number TEXT,
  status TEXT NOT NULL DEFAULT 'recorded' CHECK (status IN ('recorded', 'reversed', 'cancelled')),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency_code TEXT NOT NULL DEFAULT 'INR',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  reversal_of_sale_id UUID REFERENCES public.sales(id),
  notes TEXT,
  version INTEGER NOT NULL DEFAULT 1
);

-- ----------------------------------------------------------------------------
-- 10. SALE_ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name_snapshot TEXT NOT NULL,
  quantity NUMERIC(14,3) NOT NULL,
  unit TEXT NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------------------------
-- 11. INVENTORY_MOVEMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN (
    'opening_stock', 'sale', 'sale_reversal', 'stock_adjustment',
    'purchase_received', 'customer_return', 'supplier_return'
  )),
  quantity_delta NUMERIC(14,3) NOT NULL,
  quantity_before NUMERIC(14,3) NOT NULL,
  quantity_after NUMERIC(14,3) NOT NULL,
  unit TEXT NOT NULL,
  sale_id UUID REFERENCES public.sales(id),
  sale_item_id UUID REFERENCES public.sale_items(id),
  reversal_of_movement_id UUID REFERENCES public.inventory_movements(id),
  reason TEXT,
  created_by UUID REFERENCES public.profiles(id),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------------------------
-- 12. PURCHASE_ORDERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id),
  order_number TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'approved', 'shared', 'placed', 'partially_received', 'received', 'cancelled'
  )),
  created_by UUID REFERENCES public.profiles(id),
  order_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  expected_delivery_at TIMESTAMPTZ,
  shared_at TIMESTAMPTZ,
  placed_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  notes TEXT,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency_code TEXT NOT NULL DEFAULT 'INR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  version INTEGER NOT NULL DEFAULT 1
);

-- ----------------------------------------------------------------------------
-- 13. PURCHASE_ORDER_ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  supplier_product_id UUID REFERENCES public.supplier_products(id),
  product_name_snapshot TEXT NOT NULL,
  quantity_ordered NUMERIC(14,3) NOT NULL,
  quantity_received NUMERIC(14,3) NOT NULL DEFAULT 0,
  purchase_unit TEXT NOT NULL,
  base_units_per_purchase_unit NUMERIC(14,3) NOT NULL DEFAULT 1,
  unit_cost NUMERIC(12,2),
  line_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------------------------
-- 14. SHOP_SETTINGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shop_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL UNIQUE REFERENCES public.shops(id) ON DELETE CASCADE,
  default_language TEXT NOT NULL DEFAULT 'hi',
  default_low_stock_threshold NUMERIC(14,3) DEFAULT 5,
  default_lead_time_days INTEGER DEFAULT 2,
  default_safety_stock_quantity NUMERIC(14,3) DEFAULT 2,
  default_lookback_days INTEGER NOT NULL DEFAULT 14,
  default_target_coverage_days INTEGER DEFAULT 7,
  allow_negative_stock BOOLEAN NOT NULL DEFAULT false,
  ai_enabled BOOLEAN NOT NULL DEFAULT true,
  cloud_ai_consent BOOLEAN NOT NULL DEFAULT true,
  settings_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is active member of shop
CREATE OR REPLACE FUNCTION public.is_shop_member(target_shop_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.shop_members
    WHERE shop_id = target_shop_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can read/write their own profile
CREATE POLICY "Users can manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Shops: Users can access shops they belong to
CREATE POLICY "Members can view and manage their shops" ON public.shops
  FOR ALL USING (
    owner_user_id = auth.uid() OR public.is_shop_member(id)
  );

-- Shop Members: Members can view their team
CREATE POLICY "Members can view shop members" ON public.shop_members
  FOR ALL USING (
    user_id = auth.uid() OR public.is_shop_member(shop_id)
  );

-- Generic Shop Tables RLS Policies
CREATE POLICY "Shop members access categories" ON public.categories FOR ALL USING (public.is_shop_member(shop_id));
CREATE POLICY "Shop members access products" ON public.products FOR ALL USING (public.is_shop_member(shop_id));
CREATE POLICY "Shop members access product_aliases" ON public.product_aliases FOR ALL USING (public.is_shop_member(shop_id));
CREATE POLICY "Shop members access suppliers" ON public.suppliers FOR ALL USING (public.is_shop_member(shop_id));
CREATE POLICY "Shop members access supplier_products" ON public.supplier_products FOR ALL USING (public.is_shop_member(shop_id));
CREATE POLICY "Shop members access sales" ON public.sales FOR ALL USING (public.is_shop_member(shop_id));
CREATE POLICY "Shop members access sale_items" ON public.sale_items FOR ALL USING (public.is_shop_member(shop_id));
CREATE POLICY "Shop members access inventory_movements" ON public.inventory_movements FOR ALL USING (public.is_shop_member(shop_id));
CREATE POLICY "Shop members access purchase_orders" ON public.purchase_orders FOR ALL USING (public.is_shop_member(shop_id));
CREATE POLICY "Shop members access purchase_order_items" ON public.purchase_order_items FOR ALL USING (public.is_shop_member(shop_id));
CREATE POLICY "Shop members access shop_settings" ON public.shop_settings FOR ALL USING (public.is_shop_member(shop_id));

-- ----------------------------------------------------------------------------
-- AUTOMATIC NEW USER SETUP TRIGGER
-- Creates a profile and initial shop automatically when a user signs up!
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_shop_id UUID;
  user_full_name TEXT;
BEGIN
  user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Shopkeeper');

  -- 1. Create Profile
  INSERT INTO public.profiles (id, display_name, phone_number, preferred_language)
  VALUES (new.id, user_full_name, new.raw_user_meta_data->>'phone_number', 'hi');

  -- 2. Create Initial Shop
  INSERT INTO public.shops (name, owner_user_id, currency_code)
  VALUES (COALESCE(new.raw_user_meta_data->>'shop_name', user_full_name || ' Ki Dukan'), new.id, 'INR')
  RETURNING id INTO new_shop_id;

  -- 3. Create Shop Membership (Owner)
  INSERT INTO public.shop_members (shop_id, user_id, role, status)
  VALUES (new_shop_id, new.id, 'owner', 'active');

  -- 4. Create Shop Settings
  INSERT INTO public.shop_settings (shop_id, default_language)
  VALUES (new_shop_id, 'hi');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
