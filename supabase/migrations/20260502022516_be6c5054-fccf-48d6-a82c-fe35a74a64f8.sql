-- Push notification settings per user (granular categories)
CREATE TABLE IF NOT EXISTS public.push_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  admin_alerts BOOLEAN NOT NULL DEFAULT true,
  member_alerts BOOLEAN NOT NULL DEFAULT true,
  incoming_calls BOOLEAN NOT NULL DEFAULT true,
  lifecycle BOOLEAN NOT NULL DEFAULT true,
  quiet_hours_start SMALLINT,
  quiet_hours_end SMALLINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.push_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own push settings"
  ON public.push_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own push settings"
  ON public.push_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own push settings"
  ON public.push_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own push settings"
  ON public.push_settings FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all push settings"
  ON public.push_settings FOR SELECT
  USING (public.has_min_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_push_settings_updated_at
  BEFORE UPDATE ON public.push_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();