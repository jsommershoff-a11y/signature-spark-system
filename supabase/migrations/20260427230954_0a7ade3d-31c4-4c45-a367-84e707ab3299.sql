CREATE OR REPLACE FUNCTION public.get_trial_overview()
RETURNS TABLE(
  profile_id uuid,
  user_id uuid,
  full_name text,
  email text,
  subscription_status text,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  trial_days_remaining integer,
  live_call_used_at timestamptz,
  live_call_event_id uuid,
  live_call_event_title text,
  live_call_event_date timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  converted_at timestamptz,
  created_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id AS profile_id,
    p.user_id,
    p.full_name,
    p.email,
    p.subscription_status,
    p.trial_started_at,
    p.trial_ends_at,
    CASE
      WHEN p.trial_ends_at IS NULL THEN NULL
      ELSE GREATEST(0, CEIL(EXTRACT(EPOCH FROM (p.trial_ends_at - now())) / 86400))::int
    END AS trial_days_remaining,
    p.live_call_used_at,
    er.event_id AS live_call_event_id,
    le.title AS live_call_event_title,
    le.event_date AS live_call_event_date,
    p.stripe_customer_id,
    p.stripe_subscription_id,
    CASE WHEN p.subscription_status = 'active' THEN p.updated_at ELSE NULL END AS converted_at,
    p.created_at
  FROM public.profiles p
  LEFT JOIN LATERAL (
    SELECT er.event_id
    FROM public.event_registrations er
    WHERE er.user_id = p.user_id
    ORDER BY er.registered_at ASC
    LIMIT 1
  ) er ON true
  LEFT JOIN public.live_events le ON le.id = er.event_id
  WHERE public.has_min_role(auth.uid(), 'admin'::app_role)
    AND (
      p.subscription_status IN ('trialing','active','past_due','canceled','expired')
      OR p.trial_started_at IS NOT NULL
      OR p.live_call_used_at IS NOT NULL
    )
  ORDER BY
    CASE p.subscription_status
      WHEN 'trialing' THEN 1
      WHEN 'active' THEN 2
      WHEN 'past_due' THEN 3
      WHEN 'expired' THEN 4
      WHEN 'canceled' THEN 5
      ELSE 6
    END,
    p.trial_ends_at ASC NULLS LAST,
    p.created_at DESC
  LIMIT 1000;
$$;

REVOKE EXECUTE ON FUNCTION public.get_trial_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_trial_overview() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_trial_kpis()
RETURNS TABLE(
  total_trials integer,
  active_trials integer,
  expired_trials integer,
  active_subs integer,
  trial_call_used integer,
  conversions_30d integer,
  conversion_rate numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT * FROM public.profiles
    WHERE public.has_min_role(auth.uid(), 'admin'::app_role)
  )
  SELECT
    COUNT(*) FILTER (WHERE trial_started_at IS NOT NULL)::int,
    COUNT(*) FILTER (WHERE subscription_status = 'trialing' AND trial_ends_at > now())::int,
    COUNT(*) FILTER (WHERE trial_ends_at IS NOT NULL AND trial_ends_at <= now() AND subscription_status NOT IN ('active'))::int,
    COUNT(*) FILTER (WHERE subscription_status = 'active')::int,
    COUNT(*) FILTER (WHERE live_call_used_at IS NOT NULL)::int,
    COUNT(*) FILTER (WHERE subscription_status = 'active' AND updated_at >= now() - interval '30 days')::int,
    CASE
      WHEN COUNT(*) FILTER (WHERE trial_started_at IS NOT NULL) = 0 THEN 0
      ELSE ROUND(
        100.0
        * COUNT(*) FILTER (WHERE subscription_status = 'active' AND trial_started_at IS NOT NULL)
        / NULLIF(COUNT(*) FILTER (WHERE trial_started_at IS NOT NULL), 0),
      2)
    END
  FROM base;
$$;

REVOKE EXECUTE ON FUNCTION public.get_trial_kpis() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_trial_kpis() TO authenticated;