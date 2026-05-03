CREATE OR REPLACE FUNCTION public.get_stage_duration_stats(_days int DEFAULT 90)
RETURNS TABLE(
  stage text,
  transitions_count bigint,
  avg_hours numeric,
  median_hours numeric,
  p90_hours numeric,
  min_hours numeric,
  max_hours numeric
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _is_admin boolean;
  _profile_id uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  _is_admin := has_min_role(_uid, 'admin'::app_role);
  SELECT id INTO _profile_id FROM profiles WHERE user_id = _uid LIMIT 1;

  RETURN QUERY
  WITH events AS (
    SELECT
      a.lead_id,
      (a.metadata->>'from_stage') AS from_stage,
      (a.metadata->>'to_stage') AS to_stage,
      a.created_at,
      LEAD(a.created_at) OVER (PARTITION BY a.lead_id ORDER BY a.created_at) AS next_at
    FROM activities a
    JOIN crm_leads l ON l.id = a.lead_id
    WHERE a.type = 'stage_changed'::activity_type
      AND a.created_at >= now() - make_interval(days => _days)
      AND (
        _is_admin
        OR l.owner_user_id = _profile_id
      )
  ),
  durations AS (
    SELECT
      COALESCE(to_stage, 'unknown') AS stage,
      EXTRACT(EPOCH FROM (next_at - created_at)) / 3600.0 AS hours
    FROM events
    WHERE next_at IS NOT NULL
  )
  SELECT
    d.stage,
    COUNT(*)::bigint AS transitions_count,
    ROUND(AVG(d.hours)::numeric, 2) AS avg_hours,
    ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY d.hours)::numeric, 2) AS median_hours,
    ROUND(percentile_cont(0.9) WITHIN GROUP (ORDER BY d.hours)::numeric, 2) AS p90_hours,
    ROUND(MIN(d.hours)::numeric, 2) AS min_hours,
    ROUND(MAX(d.hours)::numeric, 2) AS max_hours
  FROM durations d
  GROUP BY d.stage
  ORDER BY transitions_count DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_stage_duration_stats(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_stage_duration_stats(int) TO authenticated;