
-- Step 01: Enum + activities table + RLS

-- 1. Create enum
CREATE TYPE public.activity_type AS ENUM ('anruf', 'email', 'meeting', 'notiz', 'fehler');

-- 2. Create activities table
CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  type activity_type NOT NULL,
  content text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT activities_target_check CHECK (lead_id IS NOT NULL OR customer_id IS NOT NULL)
);

-- 3. Indexes
CREATE INDEX idx_activities_lead_id ON public.activities(lead_id);
CREATE INDEX idx_activities_customer_id ON public.activities(customer_id);
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);

-- 4. Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Mitarbeiter can insert activities (user_id must match auth.uid via profile)
CREATE POLICY "Mitarbeiter can insert activities"
ON public.activities FOR INSERT
WITH CHECK (
  has_min_role(auth.uid(), 'mitarbeiter'::app_role)
  AND user_id = get_user_profile_id(auth.uid())
);

-- Mitarbeiter can read activities for own leads
CREATE POLICY "Mitarbeiter can read own lead activities"
ON public.activities FOR SELECT
USING (
  has_min_role(auth.uid(), 'mitarbeiter'::app_role)
  AND (
    lead_id IN (SELECT id FROM crm_leads WHERE owner_user_id = get_user_profile_id(auth.uid()))
    OR customer_id IN (SELECT id FROM profiles WHERE assigned_to = get_user_profile_id(auth.uid()))
    OR user_id = get_user_profile_id(auth.uid())
  )
);

-- Teamleiter can read team activities
CREATE POLICY "Teamleiter can read team activities"
ON public.activities FOR SELECT
USING (
  has_role(auth.uid(), 'teamleiter'::app_role)
  AND (
    lead_id IN (
      SELECT id FROM crm_leads
      WHERE owner_user_id IN (SELECT get_team_member_ids(auth.uid()))
    )
  )
);

-- Admin/GF can read all activities
CREATE POLICY "Admin/GF can read all activities"
ON public.activities FOR SELECT
USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'::app_role));

-- Admin can delete activities
CREATE POLICY "Admin can delete activities"
ON public.activities FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
