-- ============================================================
-- Step 02: Trial membership + live call tracking
-- ============================================================

-- 1) Add new columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS live_call_used_at timestamptz;

-- Validation: status must be one of allowed values
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_status_check
  CHECK (subscription_status IN ('none','trialing','active','past_due','canceled','expired'));

-- 2) Indexes for webhook lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON public.profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id
  ON public.profiles (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status
  ON public.profiles (subscription_status);

-- 3) Helper: is_active_member
-- True if user has a trialing or active subscription that hasn't ended.
CREATE OR REPLACE FUNCTION public.is_active_member(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = _user_id
      AND (
        -- Active paying member
        p.subscription_status = 'active'
        OR
        -- Trial that hasn't expired yet
        (p.subscription_status = 'trialing'
         AND p.trial_ends_at IS NOT NULL
         AND p.trial_ends_at > now())
      )
  );
$$;

-- 4) Helper: can_book_live_call
-- 1x during trial, unlimited after upgrade.
CREATE OR REPLACE FUNCTION public.can_book_live_call(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = _user_id
      AND (
        -- Active paying member: unlimited
        p.subscription_status = 'active'
        OR
        -- Trial: only if not already used
        (p.subscription_status = 'trialing'
         AND p.trial_ends_at IS NOT NULL
         AND p.trial_ends_at > now()
         AND p.live_call_used_at IS NULL)
      )
  );
$$;

-- 5) Tighten event_registrations: only active members may register
DROP POLICY IF EXISTS "Users can register for events" ON public.event_registrations;

CREATE POLICY "Active members can register for events"
ON public.event_registrations
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND public.can_book_live_call(auth.uid())
);

-- 6) Trigger: when a trial registration is inserted, mark the live call as used
CREATE OR REPLACE FUNCTION public.mark_live_call_used()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only mark for trialing users; active users have unlimited bookings
  UPDATE public.profiles
  SET live_call_used_at = COALESCE(live_call_used_at, now())
  WHERE user_id = NEW.user_id
    AND subscription_status = 'trialing'
    AND live_call_used_at IS NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mark_live_call_used ON public.event_registrations;
CREATE TRIGGER trg_mark_live_call_used
AFTER INSERT ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.mark_live_call_used();