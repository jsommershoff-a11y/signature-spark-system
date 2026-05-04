
CREATE OR REPLACE FUNCTION public.sync_website_lead_to_crm()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _first text;
  _last text;
  _exists uuid;
  _parts text[];
BEGIN
  -- Skip if a CRM-Lead with the same e-mail already exists (dedupe)
  SELECT id INTO _exists
  FROM public.crm_leads
  WHERE lower(email) = lower(NEW.email)
  LIMIT 1;
  IF _exists IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Split "name" → first / last (best-effort)
  _parts := regexp_split_to_array(coalesce(trim(NEW.name), ''), '\s+');
  _first := COALESCE(NULLIF(_parts[1], ''), NEW.email);
  IF array_length(_parts, 1) > 1 THEN
    _last := array_to_string(_parts[2:array_length(_parts,1)], ' ');
  END IF;

  INSERT INTO public.crm_leads (
    first_name, last_name, email, phone,
    source_type, source_detail, discovered_by,
    status, notes
  ) VALUES (
    _first,
    NULLIF(_last, ''),
    lower(trim(NEW.email)),
    NULLIF(trim(coalesce(NEW.phone, '')), ''),
    'inbound_organic'::lead_source_type,
    COALESCE(NEW.source, 'website'),
    'manual'::lead_discovered_by,
    'new'::lead_status,
    NEW.message
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_website_lead_to_crm ON public.leads;
CREATE TRIGGER trg_sync_website_lead_to_crm
AFTER INSERT ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.sync_website_lead_to_crm();
