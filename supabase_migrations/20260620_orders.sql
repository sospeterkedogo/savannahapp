-- Customer profiles and orders (guest + authenticated checkout)

CREATE TABLE IF NOT EXISTS savannah_customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  maps_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS savannah_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  receipt_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  customer JSONB NOT NULL DEFAULT '{}'::jsonb,
  location JSONB NOT NULL DEFAULT '{}'::jsonb,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  service TEXT NOT NULL DEFAULT 'collection',
  notes TEXT NOT NULL DEFAULT '',
  delivery_address TEXT,
  assigned_driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  delivery_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS savannah_orders_user_id_idx ON savannah_orders(user_id);
CREATE INDEX IF NOT EXISTS savannah_orders_created_at_idx ON savannah_orders(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS savannah_orders_invoice_number_idx ON savannah_orders(invoice_number);
CREATE UNIQUE INDEX IF NOT EXISTS savannah_orders_receipt_number_idx ON savannah_orders(receipt_number);

ALTER TABLE savannah_customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE savannah_orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'savannah_customer_profiles' AND policyname = 'Users manage own profile') THEN
    CREATE POLICY "Users manage own profile" ON savannah_customer_profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'savannah_orders' AND policyname = 'Users view own orders') THEN
    CREATE POLICY "Users view own orders" ON savannah_orders FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'savannah_orders' AND policyname = 'Staff manage all orders') THEN
    CREATE POLICY "Staff manage all orders" ON savannah_orders FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'savannah_orders' AND policyname = 'Service role full access orders') THEN
    CREATE POLICY "Service role full access orders" ON savannah_orders FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;
