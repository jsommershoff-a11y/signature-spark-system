SELECT cron.schedule(
  'process-zoom-summaries-hourly',
  '7 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://onbxoflsgrwdszjltnge.supabase.co/functions/v1/process-zoom-summaries',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', current_setting('app.cron_secret', true)
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);