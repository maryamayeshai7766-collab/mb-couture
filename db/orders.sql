CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  idempotency_key UUID NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  delivery_address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  delivery_instructions TEXT,
  items JSONB NOT NULL,
  subtotal_pkr INTEGER NOT NULL CHECK (subtotal_pkr >= 0),
  delivery_charge_pkr INTEGER NOT NULL CHECK (delivery_charge_pkr >= 0),
  total_pkr INTEGER NOT NULL CHECK (total_pkr >= 0),
  status TEXT NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
