
CREATE OR REPLACE FUNCTION public.find_duplicate_contacts(
  _email text DEFAULT NULL,
  _company text DEFAULT NULL,
  _exclude_id uuid DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  source text,
  match_type text,
  full_name text,
  email text,
  company text,
  record_status text,
  created_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH norm AS (
    SELECT
      NULLIF(lower(trim(_email)), '') AS email_n,
      NULLIF(lower(trim(_company)), '') AS company_n
  ),
  leads AS (
    SELECT
      l.id,
      'crm_lead'::text AS source,
      CASE
        WHEN (SELECT email_n FROM norm) IS NOT NULL AND lower(l.email) = (SELECT email_n FROM norm) THEN 'email'
        WHEN (SELECT company_n FROM norm) IS NOT NULL AND lower(l.company) = (SELECT company_n FROM norm) THEN 'company'
        ELSE NULL
      END AS match_type,
      COALESCE(NULLIF(trim(concat_ws(' ', l.first_name, l.last_name)), ''), l.email) AS full_name,
      l.email,
      l.company,
      CASE
        WHEN l.deleted_at IS NOT NULL THEN 'deleted'
        WHEN l.status::text = 'contact' THEN 'contact'
        ELSE 'lead'
      END AS record_status,
      l.created_at
    FROM crm_leads l
    WHERE l.deleted_at IS NULL
      AND (_exclude_id IS NULL OR l.id <> _exclude_id)
      AND (
        ((SELECT email_n FROM norm) IS NOT NULL AND lower(l.email) = (SELECT email_n FROM norm))
        OR ((SELECT company_n FROM norm) IS NOT NULL AND lower(l.company) = (SELECT company_n FROM norm))
      )
  ),
  customers AS (
    SELECT
      p.id,
      'profile'::text AS source,
      CASE
        WHEN (SELECT email_n FROM norm) IS NOT NULL AND lower(p.email) = (SELECT email_n FROM norm) THEN 'email'
        WHEN (SELECT company_n FROM norm) IS NOT NULL AND lower(p.company) = (SELECT company_n FROM norm) THEN 'company'
        ELSE NULL
      END AS match_type,
      p.full_name,
      p.email,
      p.company,
      'customer'::text AS record_status,
      p.created_at
    FROM profiles p
    WHERE p.deleted_at IS NULL
      AND (_exclude_id IS NULL OR p.id <> _exclude_id)
      AND (
        ((SELECT email_n FROM norm) IS NOT NULL AND lower(p.email) = (SELECT email_n FROM norm))
        OR ((SELECT company_n FROM norm) IS NOT NULL AND lower(p.company) = (SELECT company_n FROM norm))
      )
  ),
  combined AS (
    SELECT * FROM leads WHERE match_type IS NOT NULL
    UNION ALL
    SELECT * FROM customers WHERE match_type IS NOT NULL
  )
  SELECT id, source, match_type, full_name, email, company, record_status, created_at
  FROM combined
  ORDER BY (CASE WHEN match_type = 'email' THEN 0 ELSE 1 END), created_at DESC
  LIMIT 20;
$$;

REVOKE EXECUTE ON FUNCTION public.find_duplicate_contacts(text, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.find_duplicate_contacts(text, text, uuid) TO authenticated;
