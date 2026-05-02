-- Tabelle für Push-Versand-Log
CREATE TABLE IF NOT EXISTS public.push_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  data JSONB,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | sent | skipped | failed | partial
  sent_count INT NOT NULL DEFAULT 0,
  total_tokens INT NOT NULL DEFAULT 0,
  invalid_removed INT NOT NULL DEFAULT 0,
  error TEXT,
  response JSONB,
  source TEXT, -- z.B. 'crm_leads.insert', 'orders.paid'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_push_log_created ON public.push_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_push_log_user ON public.push_log (user_id);
CREATE INDEX IF NOT EXISTS idx_push_log_status ON public.push_log (status);
CREATE INDEX IF NOT EXISTS idx_push_log_category ON public.push_log (category);

ALTER TABLE public.push_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view push log" ON public.push_log;
CREATE POLICY "Admins can view push log"
  ON public.push_log FOR SELECT TO authenticated
  USING (public.has_min_role(auth.uid(), 'admin'::app_role));

-- trigger_send_push neu: legt Log-Eintrag an und übergibt log_id
CREATE OR REPLACE FUNCTION public.trigger_send_push(
  _user_id uuid,
  _category text,
  _title text,
  _body text DEFAULT NULL,
  _link text DEFAULT NULL,
  _data jsonb DEFAULT '{}'::jsonb,
  _force boolean DEFAULT false,
  _source text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _log_id uuid;
  _url text := 'https://onbxoflsgrwdszjltnge.supabase.co/functions/v1/send-push';
  _anon text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYnhvZmxzZ3J3ZHN6amx0bmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTc4NDIsImV4cCI6MjA4NTk3Mzg0Mn0.5ZsfdmpwROPn_DRYKAR0PseLdfH_Ur9Zho4lmeXmDfU';
BEGIN
  IF _user_id IS NULL THEN RETURN NULL; END IF;

  INSERT INTO public.push_log (user_id, category, title, body, link, data, source, status)
  VALUES (_user_id, _category, _title, _body, _link, _data, _source, 'pending')
  RETURNING id INTO _log_id;

  PERFORM net.http_post(
    url := _url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || _anon
    ),
    body := jsonb_build_object(
      'user_id', _user_id,
      'category', _category,
      'title', _title,
      'body', _body,
      'link', _link,
      'data', _data,
      'force', _force,
      'log_id', _log_id
    )
  );

  RETURN _log_id;
EXCEPTION WHEN OTHERS THEN
  IF _log_id IS NOT NULL THEN
    UPDATE public.push_log
       SET status='failed', error=SQLERRM, completed_at=now()
     WHERE id=_log_id;
  END IF;
  RETURN _log_id;
END;
$$;

-- Aufräumen: 30 Tage Aufbewahrung
CREATE OR REPLACE FUNCTION public.cron_cleanup_push_log()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.push_log WHERE created_at < now() - interval '30 days';
$$;

SELECT cron.unschedule('push-log-cleanup-daily')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'push-log-cleanup-daily');

SELECT cron.schedule(
  'push-log-cleanup-daily',
  '15 3 * * *',
  $cron$ SELECT public.cron_cleanup_push_log(); $cron$
);