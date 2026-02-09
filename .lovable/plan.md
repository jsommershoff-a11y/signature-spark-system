

## Fix: Infinite Recursion in Profiles RLS Policies

### Problem

The `Teamleiter can view team profiles` policy queries the `profiles` table within itself, causing **infinite recursion** (Postgres error 42P17). This breaks ALL profile lookups, including login.

```text
Error: "infinite recursion detected in policy for relation 'profiles'"
```

The root cause is this inline subquery in the policy:
```sql
team_id = (SELECT p.team_id FROM profiles p WHERE p.user_id = auth.uid())
-- This SELECT on profiles triggers the same RLS policies --> recursion
```

### Solution

Create a new **Security Definer** function `get_user_team_id()` that bypasses RLS, then update the policy to use it.

### Technical Steps

**Step 01 -- Create helper function + fix policy**

1. Create `get_user_team_id(_user_id uuid)` as `SECURITY DEFINER` to safely retrieve the team_id without triggering RLS.
2. Drop the broken `Teamleiter can view team profiles` policy.
3. Recreate it using the new helper function.
4. Also update `can_view_profile()` to use the same helper (its team check also queries profiles directly).

SQL migration:

```sql
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
```

**Step 02 -- Verify**

1. Login as test-staff (teamleiter) and confirm no 500 errors.
2. Verify profile loads correctly.
3. Verify Members page loads.
4. Run security scan to confirm no regressions.

### Risk Assessment

| Risk | Mitigation |
|------|-----------|
| `get_user_team_id` is SECURITY DEFINER | Only returns a single UUID, no data leak |
| Other policies may also recurse | Audited: only the team policy had this issue |

