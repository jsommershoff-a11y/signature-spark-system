
CREATE TABLE public.google_calendar_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  triggered_by UUID,
  calendar_id TEXT,
  window_from TIMESTAMPTZ,
  window_to TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'success',
  synced_count INTEGER NOT NULL DEFAULT 0,
  cancelled_count INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER,
  error_message TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gcal_sync_logs_profile_created ON public.google_calendar_sync_logs(profile_id, created_at DESC);

ALTER TABLE public.google_calendar_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can read own sync logs"
  ON public.google_calendar_sync_logs FOR SELECT
  USING (profile_id = get_user_profile_id(auth.uid()));

CREATE POLICY "Admin full access sync logs"
  ON public.google_calendar_sync_logs FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can read team sync logs"
  ON public.google_calendar_sync_logs FOR SELECT
  USING (has_min_role(auth.uid(), 'teamleiter'::app_role));
