-- 1) Pipeline-Update bei Erstellung eines Drafts (status = 'review_required' oder 'correction')
CREATE OR REPLACE FUNCTION public.update_pipeline_on_offer_draft_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE pipeline_items
  SET stage = 'offer_draft', stage_updated_at = now()
  WHERE lead_id = NEW.lead_id
    AND stage IN ('new_lead','setter_call_scheduled','setter_call_done','analysis_ready');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_offer_drafts_pipeline_create ON public.offer_drafts;
CREATE TRIGGER trg_offer_drafts_pipeline_create
AFTER INSERT ON public.offer_drafts
FOR EACH ROW EXECUTE FUNCTION public.update_pipeline_on_offer_draft_created();

-- 2) Pipeline-Update + Follow-up-Task bei Approval
CREATE OR REPLACE FUNCTION public.handle_offer_draft_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner uuid;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    UPDATE pipeline_items
    SET stage = 'offer_sent',
        stage_updated_at = now(),
        pipeline_priority_score = LEAST(100, COALESCE(pipeline_priority_score,0) + 15)
    WHERE lead_id = NEW.lead_id
      AND stage IN ('offer_draft','analysis_ready','setter_call_done','setter_call_scheduled','new_lead');

    SELECT owner_user_id INTO _owner FROM crm_leads WHERE id = NEW.lead_id;
    IF _owner IS NOT NULL THEN
      INSERT INTO crm_tasks (assigned_user_id, lead_id, type, title, description, due_at, status, meta)
      VALUES (
        _owner, NEW.lead_id, 'followup',
        'Follow-up zum freigegebenen Angebot',
        'Angebot wurde freigegeben und versendet. In 3 Tagen nachfassen, falls keine Reaktion.',
        now() + interval '3 days', 'open',
        jsonb_build_object('offer_draft_id', NEW.id, 'auto', true)
      );
    END IF;

    INSERT INTO activities (lead_id, activity_type, channel, direction, content, metadata)
    VALUES (NEW.lead_id, 'offer_draft_approved', 'system', 'outbound',
            'Angebotsentwurf freigegeben → Pipeline auf offer_sent, Follow-up in 3 Tagen.',
            jsonb_build_object('offer_draft_id', NEW.id));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_offer_drafts_approval ON public.offer_drafts;
CREATE TRIGGER trg_offer_drafts_approval
AFTER UPDATE ON public.offer_drafts
FOR EACH ROW EXECUTE FUNCTION public.handle_offer_draft_approval();

-- 3) Pipeline-Update bei Slot-Buchung (Setter-Call)
CREATE OR REPLACE FUNCTION public.update_pipeline_on_slot_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.lead_id IS NOT NULL AND NEW.status IN ('pending','confirmed') THEN
    UPDATE pipeline_items
    SET stage = 'setter_call_scheduled',
        stage_updated_at = now()
    WHERE lead_id = NEW.lead_id
      AND stage IN ('new_lead');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_slot_booking_pipeline ON public.slot_bookings;
CREATE TRIGGER trg_slot_booking_pipeline
AFTER INSERT ON public.slot_bookings
FOR EACH ROW EXECUTE FUNCTION public.update_pipeline_on_slot_booking();

-- 4) Approval-RPC: materialisiert Draft als Offer + setzt Status
CREATE OR REPLACE FUNCTION public.approve_offer_draft(_draft_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _draft offer_drafts%ROWTYPE;
  _offer_id uuid;
  _token text;
  _user uuid := auth.uid();
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF NOT public.has_min_role(_user, 'vertriebspartner'::app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO _draft FROM offer_drafts WHERE id = _draft_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draft not found';
  END IF;
  IF _draft.status = 'approved' THEN
    RAISE EXCEPTION 'Draft already approved';
  END IF;

  _token := encode(extensions.gen_random_bytes(24), 'hex');

  INSERT INTO offers (lead_id, status, offer_json, public_token, created_by, approved_by, approved_at, sent_at, expires_at)
  VALUES (
    _draft.lead_id,
    'sent',
    jsonb_build_object(
      'source', 'offer_draft',
      'draft_id', _draft.id,
      'problem_analysis', _draft.problem_analysis,
      'solution_concept', _draft.solution_concept,
      'required_connectors', _draft.required_connectors,
      'price_breakdown', _draft.price_breakdown,
      'pricing_strategy', _draft.pricing_strategy,
      'benefit_analysis', _draft.benefit_analysis,
      'suggested_price_cents', _draft.suggested_price_cents,
      'min_price_cents', _draft.min_price_cents,
      'margin_percent', _draft.margin_percent
    ),
    _token,
    _user, _user, now(), now(),
    now() + interval '14 days'
  )
  RETURNING id INTO _offer_id;

  UPDATE offer_drafts
  SET status = 'approved',
      approved_by = _user,
      approved_at = now(),
      converted_offer_id = _offer_id,
      updated_at = now()
  WHERE id = _draft_id;

  RETURN _offer_id;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_offer_draft(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_offer_draft(uuid) TO authenticated;