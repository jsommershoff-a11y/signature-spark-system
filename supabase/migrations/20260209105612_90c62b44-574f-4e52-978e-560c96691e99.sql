-- Step 01: Create security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.can_view_profile(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- 1. Eigenes Profil
    EXISTS (SELECT 1 FROM profiles WHERE id = _profile_id AND user_id = auth.uid())
    OR
    -- 2. GF/Admin sieht alle
    has_min_role(auth.uid(), 'geschaeftsfuehrung')
    OR
    -- 3. Zugewiesene Profile
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = _profile_id 
      AND assigned_to = get_user_profile_id(auth.uid())
    )
    OR
    -- 4. Team-Mitglieder (für Teamleiter+)
    (
      has_min_role(auth.uid(), 'teamleiter')
      AND EXISTS (
        SELECT 1 FROM profiles p1, profiles p2
        WHERE p1.id = _profile_id
        AND p2.user_id = auth.uid()
        AND p1.team_id IS NOT NULL
        AND p1.team_id = p2.team_id
      )
    )
    OR
    -- 5. Leads-Owner (Profile von Leads die ich besitze/sehen kann)
    (
      has_min_role(auth.uid(), 'mitarbeiter')
      AND EXISTS (
        SELECT 1 FROM crm_leads l
        WHERE l.owner_user_id = _profile_id
        AND l.owner_user_id = get_user_profile_id(auth.uid())
      )
    )
$$;

-- Step 02: Drop old permissive policy
DROP POLICY IF EXISTS "Staff can view profiles based on role" ON profiles;

-- Step 03: Create granular policies

-- Policy 1: Jeder sieht eigenes Profil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: GF/Admin sehen alle
CREATE POLICY "Management can view all profiles"
ON profiles FOR SELECT
USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

-- Policy 3: Staff sieht zugewiesene Profile
CREATE POLICY "Staff can view assigned profiles"
ON profiles FOR SELECT
USING (
  has_min_role(auth.uid(), 'mitarbeiter')
  AND assigned_to = get_user_profile_id(auth.uid())
);

-- Policy 4: Teamleiter sieht Team-Mitglieder
CREATE POLICY "Teamleiter can view team profiles"
ON profiles FOR SELECT
USING (
  has_min_role(auth.uid(), 'teamleiter')
  AND team_id IS NOT NULL
  AND team_id = (
    SELECT p.team_id FROM profiles p WHERE p.user_id = auth.uid()
  )
);

-- Policy 5: Mitarbeiter kann Lead-Owner-Profile sehen (für JOINs)
CREATE POLICY "Staff can view lead owner profiles"
ON profiles FOR SELECT
USING (
  has_min_role(auth.uid(), 'mitarbeiter')
  AND id IN (
    SELECT DISTINCT cl.owner_user_id 
    FROM crm_leads cl
    WHERE cl.owner_user_id = get_user_profile_id(auth.uid())
  )
);

-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON profiles(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_to ON profiles(assigned_to) WHERE assigned_to IS NOT NULL;