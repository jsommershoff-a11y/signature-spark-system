-- Create phone matching function that normalizes stored numbers before comparison
CREATE OR REPLACE FUNCTION public.match_lead_by_phone(search_suffix text)
RETURNS TABLE(id uuid, owner_user_id uuid, phone text, status text, first_name text, last_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT l.id, l.owner_user_id, l.phone, l.status::text, l.first_name, l.last_name
  FROM crm_leads l
  WHERE regexp_replace(COALESCE(l.phone, ''), '[^0-9]', '', 'g') LIKE '%' || search_suffix || '%'
  LIMIT 5;
$$;