
-- Add assignment + workflow status to inbound leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

-- Allow assigned staff to view & update their own assigned leads
DROP POLICY IF EXISTS "Assigned staff can view leads" ON public.leads;
CREATE POLICY "Assigned staff can view leads"
ON public.leads FOR SELECT
USING (
  assigned_to IS NOT NULL
  AND assigned_to = public.get_user_profile_id(auth.uid())
);

DROP POLICY IF EXISTS "Assigned staff can update leads" ON public.leads;
CREATE POLICY "Assigned staff can update leads"
ON public.leads FOR UPDATE
USING (
  assigned_to IS NOT NULL
  AND assigned_to = public.get_user_profile_id(auth.uid())
)
WITH CHECK (
  assigned_to IS NOT NULL
  AND assigned_to = public.get_user_profile_id(auth.uid())
);
