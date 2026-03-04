
-- Step 01: Auto-enrollment function + triggers

-- Add unique constraint for dedup on enrollments
ALTER TABLE public.lead_sequence_enrollments 
  ADD CONSTRAINT uq_lead_sequence UNIQUE (lead_id, sequence_id);

-- Shared enrollment function
CREATE OR REPLACE FUNCTION public.enroll_lead_in_sequences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _lead_id uuid;
  _trigger text;
  _seq RECORD;
BEGIN
  -- Determine lead_id and trigger_type based on source table
  IF TG_TABLE_NAME = 'crm_leads' THEN
    _lead_id := NEW.id;
    _trigger := 'lead_registered';
  ELSIF TG_TABLE_NAME = 'offers' THEN
    _lead_id := NEW.lead_id;
    _trigger := 'offer_created';
  ELSIF TG_TABLE_NAME = 'orders' THEN
    -- Only fire when status changes to 'paid'
    IF NEW.status::text != 'paid' OR OLD.status::text = 'paid' THEN
      RETURN NEW;
    END IF;
    _lead_id := NEW.lead_id;
    _trigger := 'product_purchased';
  ELSE
    RETURN NEW;
  END IF;

  -- Enroll in all matching active sequences
  FOR _seq IN
    SELECT id FROM email_sequences
    WHERE status = 'active' AND trigger_type = _trigger
  LOOP
    INSERT INTO lead_sequence_enrollments (lead_id, sequence_id, status, current_step, enrolled_at)
    VALUES (_lead_id, _seq.id, 'active', 0, now())
    ON CONFLICT ON CONSTRAINT uq_lead_sequence DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Trigger 1: New CRM lead
CREATE TRIGGER trg_enroll_new_lead
  AFTER INSERT ON public.crm_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.enroll_lead_in_sequences();

-- Trigger 2: New offer
CREATE TRIGGER trg_enroll_offer_created
  AFTER INSERT ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.enroll_lead_in_sequences();

-- Trigger 3: Order paid
CREATE TRIGGER trg_enroll_order_paid
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.enroll_lead_in_sequences();
