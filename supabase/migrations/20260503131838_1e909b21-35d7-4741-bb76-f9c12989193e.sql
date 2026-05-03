-- Trigger-Funktion: schreibt bei jedem Stage-Wechsel eine activity vom Typ stage_changed
CREATE OR REPLACE FUNCTION public.log_pipeline_stage_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _actor_profile_id uuid;
  _auth_uid uuid := auth.uid();
  _recent_exists boolean;
BEGIN
  -- Nur bei tatsächlichem Stage-Wechsel
  IF NEW.stage IS NOT DISTINCT FROM OLD.stage THEN
    RETURN NEW;
  END IF;

  IF NEW.lead_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Actor bestimmen: 1) auth.uid() → profile, 2) Lead-Owner als Fallback
  IF _auth_uid IS NOT NULL THEN
    SELECT id INTO _actor_profile_id FROM profiles WHERE user_id = _auth_uid LIMIT 1;
  END IF;

  IF _actor_profile_id IS NULL THEN
    SELECT owner_user_id INTO _actor_profile_id FROM crm_leads WHERE id = NEW.lead_id;
  END IF;

  -- Letzte Notlösung: irgendein Admin (user_id ist NOT NULL)
  IF _actor_profile_id IS NULL THEN
    SELECT p.id INTO _actor_profile_id
    FROM profiles p
    JOIN user_roles ur ON ur.user_id = p.user_id
    WHERE ur.role = 'admin'::app_role
    ORDER BY p.created_at ASC
    LIMIT 1;
  END IF;

  IF _actor_profile_id IS NULL THEN
    -- Kein gültiger Actor → still beenden, NOT NULL würde sonst fehlschlagen
    RETURN NEW;
  END IF;

  -- Dedup: identischer Wechsel binnen 5 Sek. (z. B. Client hat bereits geloggt)
  SELECT EXISTS (
    SELECT 1 FROM activities
    WHERE lead_id = NEW.lead_id
      AND type = 'stage_changed'::activity_type
      AND metadata->>'pipeline_item_id' = NEW.id::text
      AND metadata->>'from_stage' = COALESCE(OLD.stage::text, '')
      AND metadata->>'to_stage' = NEW.stage::text
      AND created_at > now() - interval '5 seconds'
  ) INTO _recent_exists;

  IF _recent_exists THEN
    RETURN NEW;
  END IF;

  INSERT INTO activities (lead_id, user_id, type, content, metadata)
  VALUES (
    NEW.lead_id,
    _actor_profile_id,
    'stage_changed'::activity_type,
    'Stage gewechselt: ' || COALESCE(OLD.stage::text, '—') || ' → ' || NEW.stage::text,
    jsonb_build_object(
      'from_stage', OLD.stage,
      'to_stage', NEW.stage,
      'pipeline_item_id', NEW.id,
      'via', 'db_trigger'
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_pipeline_stage_change ON public.pipeline_items;
CREATE TRIGGER trg_log_pipeline_stage_change
AFTER UPDATE OF stage ON public.pipeline_items
FOR EACH ROW
EXECUTE FUNCTION public.log_pipeline_stage_change();