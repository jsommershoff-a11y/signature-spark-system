
-- Sicherstellen dass Stripe-Felder existieren (idempotent)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS subscription_status text,
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_cancel_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON public.profiles(stripe_subscription_id);

-- RPC: Synchronisiert eine Stripe-Subscription in profiles
CREATE OR REPLACE FUNCTION public.sync_stripe_subscription(
  _stripe_customer_id text,
  _stripe_subscription_id text,
  _status text,
  _trial_start timestamptz,
  _trial_end timestamptz,
  _current_period_end timestamptz,
  _cancel_at timestamptz,
  _email text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _profile_user_id uuid;
BEGIN
  IF _stripe_customer_id IS NULL OR length(_stripe_customer_id) < 5 THEN
    RAISE EXCEPTION 'Invalid stripe_customer_id';
  END IF;

  -- 1) Profil per stripe_customer_id finden
  SELECT user_id INTO _profile_user_id
  FROM public.profiles
  WHERE stripe_customer_id = _stripe_customer_id
  LIMIT 1;

  -- 2) Fallback: Profil per E-Mail finden
  IF _profile_user_id IS NULL AND _email IS NOT NULL THEN
    SELECT user_id INTO _profile_user_id
    FROM public.profiles
    WHERE lower(email) = lower(_email)
    LIMIT 1;
  END IF;

  IF _profile_user_id IS NULL THEN
    RAISE NOTICE 'No profile found for stripe_customer % / email %', _stripe_customer_id, _email;
    RETURN NULL;
  END IF;

  UPDATE public.profiles
  SET
    stripe_customer_id = _stripe_customer_id,
    stripe_subscription_id = COALESCE(_stripe_subscription_id, stripe_subscription_id),
    subscription_status = _status,
    trial_started_at = COALESCE(_trial_start, trial_started_at),
    trial_ends_at = CASE
      WHEN _status = 'trialing' THEN _trial_end
      WHEN _status IN ('active','past_due','canceled','unpaid','incomplete','incomplete_expired') THEN trial_ends_at
      ELSE _trial_end
    END,
    subscription_current_period_end = _current_period_end,
    subscription_cancel_at = _cancel_at,
    updated_at = now()
  WHERE user_id = _profile_user_id;

  RETURN _profile_user_id;
END;
$$;

-- Erlaubt nur Service-Role bzw. authentifizierte Aufrufer (RLS auf RPC nicht möglich, aber SECURITY DEFINER kapselt Logik)
REVOKE ALL ON FUNCTION public.sync_stripe_subscription(text, text, text, timestamptz, timestamptz, timestamptz, timestamptz, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_stripe_subscription(text, text, text, timestamptz, timestamptz, timestamptz, timestamptz, text) TO service_role;
