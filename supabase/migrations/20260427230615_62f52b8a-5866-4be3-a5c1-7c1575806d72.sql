-- RPC to start a 14-day member trial for the currently authenticated user.
-- Idempotent: only sets trial fields if user has no active/trial subscription yet.
CREATE OR REPLACE FUNCTION public.start_member_trial()
RETURNS TABLE(
  subscription_status text,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  live_call_used_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.profiles p
  SET
    subscription_status = 'trialing',
    trial_started_at = COALESCE(p.trial_started_at, now()),
    trial_ends_at = COALESCE(p.trial_ends_at, now() + interval '14 days')
  WHERE p.user_id = _uid
    AND p.subscription_status NOT IN ('active','trialing');

  RETURN QUERY
  SELECT p.subscription_status, p.trial_started_at, p.trial_ends_at, p.live_call_used_at
  FROM public.profiles p
  WHERE p.user_id = _uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.start_member_trial() TO authenticated;