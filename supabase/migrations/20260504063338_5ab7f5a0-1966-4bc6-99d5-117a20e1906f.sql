-- Trigger function: mirror website lead → CRM lead
CREATE OR REPLACE FUNCTION public.mirror_website_lead_to_crm()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_id uuid;
  v_first_name text;
  v_last_name  text;
  v_parts      text[];
BEGIN
  -- Split name into first/last (best-effort; first_name is required NOT NULL)
  v_parts := regexp_split_to_array(coalesce(NULLIF(trim(NEW.name), ''), 'Anfrage'), '\s+');
  v_first_name := v_parts[1];
  IF array_length(v_parts, 1) > 1 THEN
    v_last_name := array_to_string(v_parts[2:array_length(v_parts,1)], ' ');
  END IF;

  -- Dedupe: if a non-deleted CRM lead with the same email already exists, just append note
  SELECT id INTO v_existing_id
  FROM public.crm_leads
  WHERE lower(email) = lower(NEW.email)
    AND deleted_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    UPDATE public.crm_leads
    SET
      notes = concat_ws(E'\n---\n',
        notes,
        format('[%s] Neue Website-Anfrage (Quelle: %s)%s',
          to_char(now() AT TIME ZONE 'Europe/Berlin', 'DD.MM.YYYY HH24:MI'),
          coalesce(NEW.source, 'website'),
          CASE WHEN NEW.message IS NOT NULL AND length(trim(NEW.message)) > 0
               THEN E'\n' || NEW.message ELSE '' END
        )
      ),
      updated_at = now()
    WHERE id = v_existing_id;
    RETURN NEW;
  END IF;

  -- Insert new CRM lead
  INSERT INTO public.crm_leads (
    source_type,
    source_detail,
    discovered_by,
    dedupe_key,
    first_name,
    last_name,
    email,
    phone,
    notes,
    status,
    enrichment_json
  ) VALUES (
    'inbound_organic'::lead_source_type,
    coalesce(NEW.source, 'website'),
    'website_form'::lead_discovery_source,
    lower(NEW.email),
    v_first_name,
    v_last_name,
    NEW.email,
    NEW.phone,
    NULLIF(trim(coalesce(NEW.message, '')), ''),
    'new'::lead_status,
    jsonb_build_object(
      'website_lead_id', NEW.id,
      'ref_code', NEW.ref_code,
      'imported_from', 'leads_table_trigger'
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- never block the website form
  RAISE WARNING 'mirror_website_lead_to_crm failed for lead %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mirror_website_lead_to_crm ON public.leads;

CREATE TRIGGER trg_mirror_website_lead_to_crm
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.mirror_website_lead_to_crm();