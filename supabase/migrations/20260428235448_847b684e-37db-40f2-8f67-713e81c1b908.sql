SELECT cron.unschedule('poll-telegram-updates');

SELECT cron.schedule(
  'poll-telegram-updates',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://onbxoflsgrwdszjltnge.supabase.co/functions/v1/telegram-poll',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', current_setting('app.settings.cron_secret', true)
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 58000
  ) AS request_id;
  $$
);