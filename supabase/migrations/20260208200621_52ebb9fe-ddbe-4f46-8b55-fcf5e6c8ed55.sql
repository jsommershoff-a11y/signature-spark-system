-- Enable pg_cron and pg_net extensions for scheduled HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant permissions for cron schema
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule daily prospecting run at 06:00 UTC (07:00 CET / 08:00 CEST)
SELECT cron.schedule(
  'prospecting-daily-run',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://onbxoflsgrwdszjltnge.supabase.co/functions/v1/prospecting_daily_run',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYnhvZmxzZ3J3ZHN6amx0bmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTc4NDIsImV4cCI6MjA4NTk3Mzg0Mn0.5ZsfdmpwROPn_DRYKAR0PseLdfH_Ur9Zho4lmeXmDfU"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);