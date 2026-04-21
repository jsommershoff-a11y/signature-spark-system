ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS ref_code TEXT;
CREATE INDEX IF NOT EXISTS idx_leads_ref_code ON public.leads(ref_code) WHERE ref_code IS NOT NULL;