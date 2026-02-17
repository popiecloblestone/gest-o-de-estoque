-- Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC NOT NULL CHECK (value > 0),
  active BOOLEAN DEFAULT true NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_uses INTEGER NOT NULL CHECK (max_uses > 0),
  current_uses INTEGER DEFAULT 0 NOT NULL CHECK (current_uses >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

-- Create index on active coupons
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(active) WHERE active = true;

-- Enable Row Level Security
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read coupons
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read coupons"
ON public.coupons FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to insert coupons
CREATE POLICY IF NOT EXISTS "Allow authenticated users to insert coupons"
ON public.coupons FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to update coupons
CREATE POLICY IF NOT EXISTS "Allow authenticated users to update coupons"
ON public.coupons FOR UPDATE
TO authenticated
USING (true);

-- Policy: Allow authenticated users to delete coupons
CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete coupons"
ON public.coupons FOR DELETE
TO authenticated
USING (true);
