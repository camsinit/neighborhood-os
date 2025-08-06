-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the weekly digest function to run every hour
-- This will check for neighborhoods that are ready for their Sunday 9 AM digest
SELECT cron.schedule(
  'weekly-digest-scheduler',
  '0 * * * *', -- Run every hour at the top of the hour
  $$
  select
    net.http_post(
        url:='https://nnwzfliblfuldwxpuata.supabase.co/functions/v1/schedule-weekly-digests',
        headers:='{"Content-Type": "application/json"}'::jsonb,
        body:='{"automated": true}'::jsonb
    ) as request_id;
  $$
);