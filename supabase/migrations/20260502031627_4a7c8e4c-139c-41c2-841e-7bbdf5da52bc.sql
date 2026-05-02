-- push_tokens: Geräte-Tokens für Capacitor (FCM/APNs)
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios','android','web')),
  device_info JSONB,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON public.push_tokens(user_id);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push tokens select"
  ON public.push_tokens FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own push tokens insert"
  ON public.push_tokens FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own push tokens update"
  ON public.push_tokens FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own push tokens delete"
  ON public.push_tokens FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Helper: should_send_push(user_id, category)
-- category in ('admin_alerts','member_alerts','incoming_calls','lifecycle')
CREATE OR REPLACE FUNCTION public.should_send_push(_user_id uuid, _category text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s public.push_settings%ROWTYPE;
  cat_ok boolean;
  cur_hour int;
  qs int;
  qe int;
BEGIN
  SELECT * INTO s FROM public.push_settings WHERE user_id = _user_id;
  IF NOT FOUND THEN
    -- Default: alles an, keine Ruhezeiten
    RETURN true;
  END IF;
  IF NOT s.enabled THEN RETURN false; END IF;

  cat_ok := CASE _category
    WHEN 'admin_alerts'   THEN s.admin_alerts
    WHEN 'member_alerts'  THEN s.member_alerts
    WHEN 'incoming_calls' THEN s.incoming_calls
    WHEN 'lifecycle'      THEN s.lifecycle
    ELSE true
  END;
  IF NOT cat_ok THEN RETURN false; END IF;

  qs := s.quiet_hours_start;
  qe := s.quiet_hours_end;
  IF qs IS NOT NULL AND qe IS NOT NULL AND qs <> qe THEN
    cur_hour := EXTRACT(HOUR FROM (now() AT TIME ZONE 'Europe/Berlin'))::int;
    IF qs < qe THEN
      IF cur_hour >= qs AND cur_hour < qe THEN RETURN false; END IF;
    ELSE
      -- über Mitternacht (z.B. 22 -> 7)
      IF cur_hour >= qs OR cur_hour < qe THEN RETURN false; END IF;
    END IF;
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.should_send_push(uuid, text) TO authenticated, service_role;