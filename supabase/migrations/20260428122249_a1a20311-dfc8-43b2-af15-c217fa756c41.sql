
-- Trigger anhängen (Funktion existiert bereits: public.mark_live_call_used)
DROP TRIGGER IF EXISTS tg_mark_live_call_used ON public.event_registrations;
CREATE TRIGGER tg_mark_live_call_used
AFTER INSERT ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.mark_live_call_used();

-- Eligibility-RPC für UI-Status
CREATE OR REPLACE FUNCTION public.get_live_call_eligibility(_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  can_book boolean,
  reason text,
  subscription_status text,
  trial_ends_at timestamptz,
  live_call_used_at timestamptz,
  used_event_id uuid,
  used_event_title text,
  used_event_date timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH p AS (
    SELECT subscription_status, trial_ends_at, live_call_used_at
    FROM public.profiles
    WHERE user_id = _user_id
    LIMIT 1
  ),
  used AS (
    SELECT er.event_id, le.title, le.event_date
    FROM public.event_registrations er
    JOIN public.live_events le ON le.id = er.event_id
    WHERE er.user_id = _user_id
    ORDER BY er.registered_at ASC
    LIMIT 1
  )
  SELECT
    -- can_book: aktiv = immer, trialing+nicht_genutzt = ja, sonst nein
    CASE
      WHEN p.subscription_status = 'active' THEN true
      WHEN p.subscription_status = 'trialing'
           AND p.trial_ends_at IS NOT NULL
           AND p.trial_ends_at > now()
           AND p.live_call_used_at IS NULL THEN true
      ELSE false
    END AS can_book,
    CASE
      WHEN p.subscription_status = 'active' THEN 'active'
      WHEN p.subscription_status = 'trialing'
           AND (p.trial_ends_at IS NULL OR p.trial_ends_at <= now()) THEN 'expired'
      WHEN p.subscription_status = 'trialing' AND p.live_call_used_at IS NOT NULL THEN 'trial_used'
      WHEN p.subscription_status = 'trialing' THEN 'trial_available'
      WHEN p.subscription_status IN ('past_due','canceled','unpaid','incomplete','incomplete_expired','expired') THEN 'expired'
      ELSE 'no_access'
    END AS reason,
    p.subscription_status,
    p.trial_ends_at,
    p.live_call_used_at,
    used.event_id,
    used.title,
    used.event_date
  FROM p
  LEFT JOIN used ON true;
$$;

REVOKE ALL ON FUNCTION public.get_live_call_eligibility(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_live_call_eligibility(uuid) TO authenticated;
