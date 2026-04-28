ALTER TABLE public.catalog_products
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS offer_template text,
  ADD COLUMN IF NOT EXISTS offer_prompt text,
  ADD COLUMN IF NOT EXISTS required_connectors text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS optional_connectors text[] NOT NULL DEFAULT '{}'::text[];