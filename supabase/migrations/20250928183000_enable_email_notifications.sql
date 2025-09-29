-- Enable Email Notifications for All Users
-- The previous migration only set weekly_summary to true but didn't enable the main email flag
-- This fixes that oversight

-- Enable email notifications for ALL users
UPDATE public.profiles
SET notification_preferences = jsonb_set(
  COALESCE(notification_preferences, '{}'::jsonb),
  '{email,enabled}',
  'true'::jsonb,
  true
)
WHERE notification_preferences->'email'->>'enabled' = 'false'
   OR notification_preferences->'email'->>'enabled' IS NULL;

-- Also ensure weekly_summary is true (belt and suspenders)
UPDATE public.profiles
SET notification_preferences = jsonb_set(
  COALESCE(notification_preferences, '{}'::jsonb),
  '{email,types,weekly_summary}',
  'true'::jsonb,
  true
);

-- Log the update
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM profiles
  WHERE notification_preferences->'email'->>'enabled' = 'true';

  RAISE NOTICE 'Email notifications enabled for % profiles', updated_count;
  RAISE NOTICE 'All users will now receive weekly digests';
END $$;