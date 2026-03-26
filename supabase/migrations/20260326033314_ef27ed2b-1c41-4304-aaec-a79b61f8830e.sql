-- Fix DB functions that still reference old role names

-- 1. assign_default_role: 'kunde' -> 'member_basic'
CREATE OR REPLACE FUNCTION public.assign_default_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, 'member_basic');
  RETURN NEW;
END;
$function$;

-- 2. assign_lead_round_robin: old roles -> new staff roles
CREATE OR REPLACE FUNCTION public.assign_lead_round_robin()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  next_profile_id UUID;
BEGIN
  IF NEW.owner_user_id IS NULL THEN
    SELECT p.id INTO next_profile_id
    FROM profiles p
    JOIN user_roles ur ON ur.user_id = p.user_id
    WHERE ur.role IN ('vertriebspartner', 'gruppenbetreuer', 'admin')
    ORDER BY (
      SELECT COUNT(*) FROM crm_leads 
      WHERE owner_user_id = p.id 
      AND status = 'new'
    ) ASC
    LIMIT 1;
    
    NEW.owner_user_id := next_profile_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. get_customers: 'kunde' -> member roles, 'mitarbeiter' -> 'vertriebspartner'
CREATE OR REPLACE FUNCTION public.get_customers()
 RETURNS TABLE(id uuid, full_name text, first_name text, last_name text, email text, phone text, company text, created_at timestamp with time zone, assigned_to uuid, assigned_staff_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    p.id,
    p.full_name,
    p.first_name,
    p.last_name,
    p.email,
    p.phone,
    p.company,
    p.created_at,
    p.assigned_to,
    staff.full_name AS assigned_staff_name
  FROM profiles p
  INNER JOIN user_roles ur ON ur.user_id = p.user_id
  LEFT JOIN profiles staff ON staff.id = p.assigned_to
  WHERE ur.role IN ('member_basic', 'member_starter', 'member_pro')
    AND has_min_role(auth.uid(), 'vertriebspartner')
$function$;

-- 4. can_view_profile: update old role references
CREATE OR REPLACE FUNCTION public.can_view_profile(_profile_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    EXISTS (SELECT 1 FROM profiles WHERE id = _profile_id AND user_id = auth.uid())
    OR
    has_min_role(auth.uid(), 'admin')
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = _profile_id 
      AND assigned_to = get_user_profile_id(auth.uid())
    )
    OR
    (
      has_min_role(auth.uid(), 'gruppenbetreuer')
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = _profile_id
        AND team_id IS NOT NULL
        AND team_id = get_user_team_id(auth.uid())
      )
    )
    OR
    (
      has_min_role(auth.uid(), 'vertriebspartner')
      AND EXISTS (
        SELECT 1 FROM crm_leads l
        WHERE l.owner_user_id = _profile_id
        AND l.owner_user_id = get_user_profile_id(auth.uid())
      )
    )
$function$;