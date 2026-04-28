ALTER TABLE public.offer_drafts
  ADD COLUMN IF NOT EXISTS price_breakdown jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS catalog_subtotal_cents integer,
  ADD COLUMN IF NOT EXISTS adjustments_subtotal_cents integer,
  ADD COLUMN IF NOT EXISTS custom_subtotal_cents integer;

COMMENT ON COLUMN public.offer_drafts.price_breakdown IS
  'Transparente Preisherleitung: Array aus Katalog-Positionen (mit Basispreis + Aufschlag + Begründung) und optionalen Custom-Add-ons.';