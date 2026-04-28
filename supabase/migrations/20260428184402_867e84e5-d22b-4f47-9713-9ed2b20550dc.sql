-- RPC: Funnel stats per module & tier
CREATE OR REPLACE FUNCTION public.get_upgrade_funnel_stats(
  _from timestamptz DEFAULT (now() - interval '30 days'),
  _to   timestamptz DEFAULT now()
)
RETURNS TABLE(
  module_type text,
  required_tier text,
  views bigint,
  cta_clicks bigint,
  upgrades bigint,
  view_to_click_rate numeric,
  click_to_upgrade_rate numeric,
  view_to_upgrade_rate numeric
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_min_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  WITH ev AS (
    SELECT
      e.user_id,
      e.event_name,
      COALESCE(NULLIF(e.properties->>'moduleType', ''), 'generic') AS module_type,
      COALESCE(NULLIF(e.properties->>'requiredTier', ''), 'Starter') AS required_tier,
      e.created_at
    FROM public.analytics_events e
    WHERE e.created_at >= _from
      AND e.created_at <  _to
      AND e.event_name IN ('view_locked_module','upgrade_cta_click')
  ),
  views_agg AS (
    SELECT module_type, required_tier, COUNT(*) AS views
    FROM ev WHERE event_name = 'view_locked_module'
    GROUP BY 1,2
  ),
  clicks_agg AS (
    SELECT module_type, required_tier, COUNT(*) AS clicks
    FROM ev WHERE event_name = 'upgrade_cta_click'
    GROUP BY 1,2
  ),
  -- Distinct clickers per (module, tier)
  clickers AS (
    SELECT DISTINCT module_type, required_tier, user_id
    FROM ev
    WHERE event_name = 'upgrade_cta_click' AND user_id IS NOT NULL
  ),
  -- Map required_tier label -> minimum role
  tier_role AS (
    SELECT * FROM (VALUES
      ('Starter',   'member_starter'::app_role),
      ('starter',   'member_starter'::app_role),
      ('Pro',       'member_pro'::app_role),
      ('pro',       'member_pro'::app_role),
      ('Premium',   'member_pro'::app_role),
      ('Basic',     'member_basic'::app_role),
      ('basic',     'member_basic'::app_role)
    ) AS t(label, min_role)
  ),
  upgrades_agg AS (
    SELECT c.module_type, c.required_tier, COUNT(*) AS upgrades
    FROM clickers c
    LEFT JOIN tier_role tr ON tr.label = c.required_tier
    WHERE public.has_min_role(c.user_id, COALESCE(tr.min_role, 'member_starter'::app_role))
    GROUP BY 1,2
  ),
  keys AS (
    SELECT module_type, required_tier FROM views_agg
    UNION
    SELECT module_type, required_tier FROM clicks_agg
    UNION
    SELECT module_type, required_tier FROM upgrades_agg
  )
  SELECT
    k.module_type,
    k.required_tier,
    COALESCE(v.views, 0)     AS views,
    COALESCE(c.clicks, 0)    AS cta_clicks,
    COALESCE(u.upgrades, 0)  AS upgrades,
    CASE WHEN COALESCE(v.views,0) > 0
         THEN ROUND(100.0 * COALESCE(c.clicks,0) / v.views, 2)
         ELSE NULL END AS view_to_click_rate,
    CASE WHEN COALESCE(c.clicks,0) > 0
         THEN ROUND(100.0 * COALESCE(u.upgrades,0) / c.clicks, 2)
         ELSE NULL END AS click_to_upgrade_rate,
    CASE WHEN COALESCE(v.views,0) > 0
         THEN ROUND(100.0 * COALESCE(u.upgrades,0) / v.views, 2)
         ELSE NULL END AS view_to_upgrade_rate
  FROM keys k
  LEFT JOIN views_agg    v ON v.module_type = k.module_type AND v.required_tier = k.required_tier
  LEFT JOIN clicks_agg   c ON c.module_type = k.module_type AND c.required_tier = k.required_tier
  LEFT JOIN upgrades_agg u ON u.module_type = k.module_type AND u.required_tier = k.required_tier
  ORDER BY COALESCE(v.views,0) DESC, COALESCE(c.clicks,0) DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_upgrade_funnel_stats(timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_upgrade_funnel_stats(timestamptz, timestamptz) TO authenticated;