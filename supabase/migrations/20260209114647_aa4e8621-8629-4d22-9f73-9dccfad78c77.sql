
-- 1. Helper function to get user's team_id without RLS
CREATE OR REPLACE FUNCTION public.get_user_team_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT team_id FROM profiles WHERE user_id = _user_id LIMIT 1
$$;

-- 2. Fix the recursive policy
DROP POLICY IF EXISTS "Teamleiter can view team profiles" ON profiles;

CREATE POLICY "Teamleiter can view team profiles"
ON profiles FOR SELECT
USING (
  has_min_role(auth.uid(), 'teamleiter')
  AND team_id IS NOT NULL
  AND team_id = get_user_team_id(auth.uid())
);

-- 3. Update can_view_profile to also use the helper
CREATE OR REPLACE FUNCTION public.can_view_profile(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    EXISTS (SELECT 1 FROM profiles WHERE id = _profile_id AND user_id = auth.uid())
    OR
    has_min_role(auth.uid(), 'geschaeftsfuehrung')
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = _profile_id 
      AND assigned_to = get_user_profile_id(auth.uid())
    )
    OR
    (
      has_min_role(auth.uid(), 'teamleiter')
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = _profile_id
        AND team_id IS NOT NULL
        AND team_id = get_user_team_id(auth.uid())
      )
    )
    OR
    (
      has_min_role(auth.uid(), 'mitarbeiter')
      AND EXISTS (
        SELECT 1 FROM crm_leads l
        WHERE l.owner_user_id = _profile_id
        AND l.owner_user_id = get_user_profile_id(auth.uid())
      )
    )
$$;
