
-- Stage enum for the new Deal pipeline (classic 6-stage funnel)
DO $$ BEGIN
  CREATE TYPE public.deal_stage AS ENUM ('new','qualified','proposal','negotiation','won','lost');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  stage public.deal_stage NOT NULL DEFAULT 'new',
  value numeric(12,2) DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  probability int NOT NULL DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date date,
  lead_id uuid REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  lost_reason text,
  notes text,
  stage_updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_owner ON public.deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_lead ON public.deals(lead_id);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- updated_at + stage_updated_at trigger
CREATE OR REPLACE FUNCTION public.deals_set_timestamps()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  IF TG_OP = 'UPDATE' AND NEW.stage IS DISTINCT FROM OLD.stage THEN
    NEW.stage_updated_at = now();
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_deals_set_timestamps ON public.deals;
CREATE TRIGGER trg_deals_set_timestamps
BEFORE UPDATE ON public.deals
FOR EACH ROW EXECUTE FUNCTION public.deals_set_timestamps();

-- Helper: caller is sales staff
CREATE OR REPLACE FUNCTION public.is_sales_staff(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _uid
      AND role IN ('admin','vertriebspartner','gruppenbetreuer','mitarbeiter')
  )
$$;

-- RLS Policies
DROP POLICY IF EXISTS "deals_admin_all" ON public.deals;
CREATE POLICY "deals_admin_all" ON public.deals
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "deals_sales_select" ON public.deals;
CREATE POLICY "deals_sales_select" ON public.deals
FOR SELECT TO authenticated
USING (public.is_sales_staff(auth.uid()));

DROP POLICY IF EXISTS "deals_sales_insert" ON public.deals;
CREATE POLICY "deals_sales_insert" ON public.deals
FOR INSERT TO authenticated
WITH CHECK (
  public.is_sales_staff(auth.uid())
  AND (owner_id IS NULL OR owner_id = auth.uid())
);

DROP POLICY IF EXISTS "deals_owner_update" ON public.deals;
CREATE POLICY "deals_owner_update" ON public.deals
FOR UPDATE TO authenticated
USING (
  public.is_sales_staff(auth.uid())
  AND (owner_id = auth.uid() OR owner_id IS NULL)
)
WITH CHECK (
  public.is_sales_staff(auth.uid())
  AND (owner_id = auth.uid() OR owner_id IS NULL)
);

DROP POLICY IF EXISTS "deals_owner_delete" ON public.deals;
CREATE POLICY "deals_owner_delete" ON public.deals
FOR DELETE TO authenticated
USING (
  public.is_sales_staff(auth.uid())
  AND (owner_id = auth.uid() OR owner_id IS NULL)
);
