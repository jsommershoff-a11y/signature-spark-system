do $$
begin
  perform cron.unschedule('telegram-daily-summary-1600utc');
exception when others then null;
end $$;
do $$
begin
  perform cron.unschedule('telegram-daily-summary-1700utc');
exception when others then null;
end $$;

select cron.schedule(
  'telegram-daily-summary-1600utc',
  '0 16 * * *',
  $$
  SELECT net.http_post(
    url := 'https://onbxoflsgrwdszjltnge.supabase.co/functions/v1/telegram-daily-summary',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', current_setting('app.settings.cron_secret', true)
    ),
    body := jsonb_build_object('triggered_by', 'cron')
  ) AS request_id;
  $$
);

select cron.schedule(
  'telegram-daily-summary-1700utc',
  '0 17 * * *',
  $$
  SELECT net.http_post(
    url := 'https://onbxoflsgrwdszjltnge.supabase.co/functions/v1/telegram-daily-summary',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', current_setting('app.settings.cron_secret', true)
    ),
    body := jsonb_build_object('triggered_by', 'cron')
  ) AS request_id;
  $$
);