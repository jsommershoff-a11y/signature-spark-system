
-- =============================================
-- COO Cockpit Tables
-- =============================================

-- 1. invoices
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id text,
  datum date,
  faelligkeit date,
  betrag_brutto numeric NOT NULL DEFAULT 0,
  betrag_netto numeric NOT NULL DEFAULT 0,
  ust numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'offen',
  gegenpartei text,
  crm_id text,
  objekt text,
  kostenstelle text,
  bereich text,
  bezahlt_am date,
  cash_flag boolean DEFAULT false,
  erstattungsfaehig boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. contacts (COO)
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crm_id text,
  name text NOT NULL,
  typ text,
  email text,
  telefon text,
  ust_id text,
  zahlungsziel integer,
  standard_konto text,
  kostenstelle text,
  erstellt_am timestamptz DEFAULT now(),
  hubspot_id text
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access contacts" ON public.contacts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. open_items
CREATE TABLE public.open_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  typ text,
  gegenpartei text,
  betrag numeric NOT NULL DEFAULT 0,
  faelligkeit date,
  tage_ueberfaellig integer DEFAULT 0,
  status text DEFAULT 'offen',
  risiko text,
  objekt text,
  kostenstelle text,
  quelle text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.open_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access open_items" ON public.open_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. revenue_summary
CREATE TABLE public.revenue_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monat text NOT NULL,
  bereich text,
  objekt text,
  ist_umsatz numeric NOT NULL DEFAULT 0,
  plan_umsatz numeric DEFAULT 0,
  delta numeric DEFAULT 0,
  quelle text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.revenue_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access revenue_summary" ON public.revenue_summary
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. sync_logs
CREATE TABLE public.sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  workflow text,
  status text DEFAULT 'success',
  entity text,
  message text,
  records_processed integer DEFAULT 0
);

ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access sync_logs" ON public.sync_logs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. sync_errors
CREATE TABLE public.sync_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  workflow text,
  node_name text,
  entity text,
  error_message text,
  raw_payload jsonb
);

ALTER TABLE public.sync_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access sync_errors" ON public.sync_errors
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
