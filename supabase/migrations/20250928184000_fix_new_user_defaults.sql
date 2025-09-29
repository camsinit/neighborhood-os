-- Fix New User Profile Creation to Include Newsletter Preferences
-- This ensures new users automatically get email notifications enabled

-- Update the handle_new_user function to set proper notification preferences
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Create profile with proper notification preferences enabled by default
  INSERT INTO profiles (
    id,
    notification_preferences
  )
  VALUES (
    new.id,
    jsonb_build_object(
      'email', jsonb_build_object(
        'enabled', true,
        'types', jsonb_build_object(
          'weekly_summary', true,
          'neighbor_activity', true,
          'skill_requests', true,
          'calendar_events', true,
          'group_activity', true
        )
      )
    )
  );

  -- Create user role
  INSERT INTO user_roles (user_id, role)
  VALUES (new.id, 'user');

  RETURN new;
END;
$$;

-- Log the update
DO $$
BEGIN
  RAISE NOTICE 'Updated handle_new_user function to enable notifications by default';
  RAISE NOTICE 'New users will automatically receive weekly newsletters';
END $$;