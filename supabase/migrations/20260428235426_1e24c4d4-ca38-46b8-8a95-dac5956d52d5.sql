-- Remove existing job if present (idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'poll-telegram-updates') THEN
    PERFORM cron.unschedule('poll-telegram-updates');
  END IF;
END $$;

SELECT cron.schedule(
  'poll-telegram-updates',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://onbxoflsgrwdszjltnge.supabase.co/functions/v1/telegram-poll',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', current_setting('app.cron_secret', true)
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 58000
  );
  $$
);