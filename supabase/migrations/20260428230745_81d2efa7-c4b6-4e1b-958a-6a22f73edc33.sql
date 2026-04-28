do $$
begin perform cron.unschedule('telegram-weekly-summary-sun1600utc'); exception when others then null; end $$;
do $$
begin perform cron.unschedule('telegram-weekly-summary-sun1700utc'); exception when others then null; end $$;

select cron.schedule(
  'telegram-weekly-summary-sun1600utc',
  '0 16 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://onbxoflsgrwdszjltnge.supabase.co/functions/v1/telegram-weekly-summary',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', current_setting('app.settings.cron_secret', true)
    ),
    body := jsonb_build_object('triggered_by', 'cron')
  ) AS request_id;
  $$
);

select cron.schedule(
  'telegram-weekly-summary-sun1700utc',
  '0 17 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://onbxoflsgrwdszjltnge.supabase.co/functions/v1/telegram-weekly-summary',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', current_setting('app.settings.cron_secret', true)
    ),
    body := jsonb_build_object('triggered_by', 'cron')
  ) AS request_id;
  $$
);