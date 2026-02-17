
CREATE OR REPLACE FUNCTION public.get_customers()
RETURNS TABLE(
  id uuid,
  full_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  company text,
  created_at timestamptz,
  assigned_to uuid,
  assigned_staff_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
  WHERE ur.role = 'kunde'
    AND has_min_role(auth.uid(), 'mitarbeiter')
$$;
