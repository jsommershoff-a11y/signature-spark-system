-- =============================================
-- sevDesk Integration: external IDs + sync log
-- =============================================

-- Track external sevDesk IDs on existing entities so we can dedupe and patch
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS sevdesk_id text;

ALTER TABLE public.crm_leads
  ADD COLUMN IF NOT EXISTS sevdesk_id text;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS sevdesk_id text;

ALTER TABLE public.offers
  ADD COLUMN IF NOT EXISTS sevdesk_invoice_id text;

-- UNIQUE so we can `upsert(..., { onConflict: "sevdesk_id" })` from the edge function.
-- Postgres treats NULLs as distinct, so multiple rows without a sevDesk link still coexist.
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_sevdesk_id ON public.contacts(sevdesk_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_leads_sevdesk_id ON public.crm_leads(sevdesk_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_sevdesk_id ON public.invoices(sevdesk_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_offers_sevdesk_invoice_id ON public.offers(sevdesk_invoice_id);
