-- Disable Weekly Digest Scheduler
-- This migration unschedules the automated weekly newsletter cron job
-- The newsletter can still be manually triggered via GitHub Actions workflow_dispatch

-- Unschedule the weekly digest cron job
SELECT cron.unschedule('weekly-digest-scheduler');

-- Log the change
DO $$
BEGIN
  RAISE NOTICE 'Weekly digest scheduler cron job has been unscheduled';
  RAISE NOTICE 'Newsletter can still be manually triggered via GitHub Actions';
END $$;

