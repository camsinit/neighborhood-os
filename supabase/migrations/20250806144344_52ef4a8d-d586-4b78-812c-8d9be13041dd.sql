-- Add timezone-aware scheduling support and email preferences to neighborhoods table
ALTER TABLE neighborhoods 
ADD COLUMN IF NOT EXISTS last_weekly_digest_sent timestamp with time zone DEFAULT NULL;

-- Add email preferences to profiles table if not exists (expand existing preferences)
UPDATE profiles 
SET notification_preferences = jsonb_set(
  notification_preferences,
  '{email,weekly_digest}',
  'true'::jsonb,
  true
)
WHERE notification_preferences->'email'->'weekly_digest' IS NULL;

-- Create index for efficient timezone queries
CREATE INDEX IF NOT EXISTS idx_neighborhoods_timezone_digest 
ON neighborhoods(timezone, last_weekly_digest_sent);