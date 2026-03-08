-- Step 1: Make calls.lead_id nullable to support unknown contacts
ALTER TABLE public.calls ALTER COLUMN lead_id DROP NOT NULL;

-- Step 2: Update RLS policies for calls to handle NULL lead_id
-- Mitarbeiter can read calls with NULL lead_id (unknown contacts)
DROP POLICY IF EXISTS "Mitarbeiter can read own calls" ON public.calls;
CREATE POLICY "Mitarbeiter can read own calls" ON public.calls
  FOR SELECT USING (
    has_min_role(auth.uid(), 'mitarbeiter'::app_role) AND (
      conducted_by = get_user_profile_id(auth.uid())
      OR lead_id IS NULL
      OR lead_id IN (
        SELECT id FROM crm_leads WHERE owner_user_id = get_user_profile_id(auth.uid())
      )
    )
  );

-- Mitarbeiter can update calls with NULL lead_id
DROP POLICY IF EXISTS "Mitarbeiter can update own calls" ON public.calls;
CREATE POLICY "Mitarbeiter can update own calls" ON public.calls
  FOR UPDATE USING (
    has_min_role(auth.uid(), 'mitarbeiter'::app_role) AND (
      conducted_by = get_user_profile_id(auth.uid())
      OR lead_id IS NULL
      OR lead_id IN (
        SELECT id FROM crm_leads WHERE owner_user_id = get_user_profile_id(auth.uid())
      )
    )
  );