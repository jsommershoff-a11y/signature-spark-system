
-- =========================================================
-- 1. Neuer Status 'contact' für crm_leads
-- =========================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'lead_status' AND e.enumlabel = 'contact'
  ) THEN
    -- crm_leads.status ist als TEXT mit CHECK oder als enum modelliert?
    -- Wir prüfen: falls enum, ALTER TYPE; falls text, kein-op.
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
      ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'contact' BEFORE 'new';
    END IF;
  END IF;
END $$;

-- =========================================================
-- 2. Soft-Delete-Spalten
-- =========================================================
ALTER TABLE public.crm_leads
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid;

CREATE INDEX IF NOT EXISTS idx_crm_leads_deleted_at ON public.crm_leads(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON public.crm_leads(status);

-- =========================================================
-- 3. Pipeline-Trigger anpassen: kein Pipeline-Item für Kontakte,
--    sondern erst beim Convert (status: contact -> new/qualified)
-- =========================================================
CREATE OR REPLACE FUNCTION public.create_pipeline_item_for_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Kontakte erhalten KEIN Pipeline-Item
  IF NEW.status::text = 'contact' THEN
    RETURN NEW;
  END IF;

  INSERT INTO pipeline_items (lead_id, stage, pipeline_priority_score)
  VALUES (
    NEW.id,
    'new_lead',
    calculate_pipeline_priority(NEW.icp_fit_score, NEW.source_priority_weight, NULL, NULL)
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Trigger: bei UPDATE von contact -> aktiv, Pipeline-Item erzeugen
CREATE OR REPLACE FUNCTION public.create_pipeline_item_on_convert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.status::text = 'contact' AND NEW.status::text <> 'contact' THEN
    INSERT INTO pipeline_items (lead_id, stage, pipeline_priority_score)
    VALUES (
      NEW.id,
      'new_lead',
      calculate_pipeline_priority(NEW.icp_fit_score, NEW.source_priority_weight, NULL, NULL)
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_create_pipeline_item_on_convert ON public.crm_leads;
CREATE TRIGGER trg_create_pipeline_item_on_convert
AFTER UPDATE OF status ON public.crm_leads
FOR EACH ROW
EXECUTE FUNCTION public.create_pipeline_item_on_convert();

-- =========================================================
-- 4. get_customers neu: gemischte Liste (Kunden + Kontakte + Leads)
-- =========================================================
DROP FUNCTION IF EXISTS public.get_customers();

CREATE OR REPLACE FUNCTION public.get_customers(
  _include_deleted boolean DEFAULT false,
  _status_filter text DEFAULT NULL  -- 'customer' | 'contact' | 'lead' | 'deleted' | NULL (alle aktiven)
)
RETURNS TABLE(
  id uuid,
  source text,            -- 'profile' | 'crm_lead'
  full_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  company text,
  created_at timestamptz,
  assigned_to uuid,
  assigned_staff_name text,
  record_status text,     -- 'customer' | 'contact' | 'lead' | 'deleted'
  deleted_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH
  -- Zahlende Mitglieder (aus profiles)
  customers AS (
    SELECT
      p.id,
      'profile'::text AS source,
      p.full_name, p.first_name, p.last_name, p.email, p.phone, p.company,
      p.created_at, p.assigned_to,
      staff.full_name AS assigned_staff_name,
      CASE WHEN p.deleted_at IS NOT NULL THEN 'deleted' ELSE 'customer' END AS record_status,
      p.deleted_at
    FROM profiles p
    INNER JOIN user_roles ur ON ur.user_id = p.user_id
    LEFT JOIN profiles staff ON staff.id = p.assigned_to
    WHERE ur.role IN ('member_basic','member_starter','member_pro','kunde')
      AND has_min_role(auth.uid(), 'vertriebspartner')
      AND (_include_deleted OR p.deleted_at IS NULL)
  ),
  -- Kontakte und Leads aus crm_leads
  leads AS (
    SELECT
      l.id,
      'crm_lead'::text AS source,
      COALESCE(NULLIF(trim(concat_ws(' ', l.first_name, l.last_name)), ''), l.email) AS full_name,
      l.first_name, l.last_name, l.email, l.phone, l.company,
      l.created_at, l.owner_user_id AS assigned_to,
      staff.full_name AS assigned_staff_name,
      CASE
        WHEN l.deleted_at IS NOT NULL THEN 'deleted'
        WHEN l.status::text = 'contact' THEN 'contact'
        ELSE 'lead'
      END AS record_status,
      l.deleted_at
    FROM crm_leads l
    LEFT JOIN profiles staff ON staff.id = l.owner_user_id
    WHERE has_min_role(auth.uid(), 'vertriebspartner')
      AND (_include_deleted OR l.deleted_at IS NULL)
  ),
  combined AS (
    SELECT * FROM customers
    UNION ALL
    SELECT * FROM leads
  )
  SELECT *
  FROM combined
  WHERE _status_filter IS NULL OR record_status = _status_filter
  ORDER BY created_at DESC;
$function$;

-- =========================================================
-- 5. Convert: Kontakt -> Lead
-- =========================================================
CREATE OR REPLACE FUNCTION public.convert_contact_to_lead(_lead_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _row crm_leads%ROWTYPE;
BEGIN
  IF NOT has_min_role(auth.uid(), 'vertriebspartner') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO _row FROM crm_leads WHERE id = _lead_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;
  IF _row.status::text <> 'contact' THEN
    RAISE EXCEPTION 'Lead is not a contact (current status: %)', _row.status;
  END IF;

  UPDATE crm_leads
  SET status = 'new', updated_at = now()
  WHERE id = _lead_id;

  RETURN _lead_id;
END;
$function$;

-- =========================================================
-- 6. Soft-Delete RPCs
-- =========================================================
CREATE OR REPLACE FUNCTION public.soft_delete_customer(_id uuid, _source text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF NOT has_min_role(_uid, 'vertriebspartner') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _source NOT IN ('profile','crm_lead') THEN
    RAISE EXCEPTION 'Invalid source';
  END IF;

  IF _source = 'profile' THEN
    UPDATE profiles
    SET deleted_at = now(), deleted_by = _uid, updated_at = now()
    WHERE id = _id AND deleted_at IS NULL;
  ELSE
    UPDATE crm_leads
    SET deleted_at = now(), deleted_by = _uid, updated_at = now()
    WHERE id = _id AND deleted_at IS NULL;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.restore_customer(_id uuid, _source text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF NOT has_min_role(_uid, 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _source NOT IN ('profile','crm_lead') THEN
    RAISE EXCEPTION 'Invalid source';
  END IF;

  IF _source = 'profile' THEN
    UPDATE profiles SET deleted_at = NULL, deleted_by = NULL, updated_at = now() WHERE id = _id;
  ELSE
    UPDATE crm_leads SET deleted_at = NULL, deleted_by = NULL, updated_at = now() WHERE id = _id;
  END IF;
END;
$function$;

-- Bulk-Variante
CREATE OR REPLACE FUNCTION public.bulk_soft_delete_customers(_items jsonb)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _item jsonb;
  _count int := 0;
BEGIN
  IF NOT has_min_role(auth.uid(), 'vertriebspartner') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  FOR _item IN SELECT * FROM jsonb_array_elements(_items)
  LOOP
    PERFORM public.soft_delete_customer(
      (_item->>'id')::uuid,
      _item->>'source'
    );
    _count := _count + 1;
  END LOOP;
  RETURN _count;
END;
$function$;
