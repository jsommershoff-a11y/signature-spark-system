
CREATE OR REPLACE FUNCTION public.update_pipeline_after_offer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE pipeline_items
  SET
    stage = CASE
      WHEN stage IN ('new_lead','setter_call_scheduled','setter_call_done','analysis_ready')
      THEN 'offer_sent'
      ELSE stage
    END,
    stage_updated_at = now(),
    pipeline_priority_score = LEAST(100, COALESCE(pipeline_priority_score, 0) + 10)
  WHERE lead_id = NEW.lead_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pipeline_after_offer
  AFTER INSERT ON offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pipeline_after_offer();
