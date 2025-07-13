-- Enable required extensions for cron jobs
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Create a cron job to process the email queue every 5 minutes
-- This will automatically send queued emails
select
cron.schedule(
  'process-email-queue',
  '*/5 * * * *', -- every 5 minutes
  $$
  select
    net.http_post(
        url:='https://nnwzfliblfuldwxpuata.supabase.co/functions/v1/process-email-queue',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ud3pmbGlibGZ1bGR3eHB1YXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0MTYwNTgsImV4cCI6MjA1NDk5MjA1OH0.jEa99YSuIt36oOyaAvIZ5pGCDk9vSa3tBfi43Uqm8OU"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);