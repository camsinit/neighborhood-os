-- Simplify Email Notification Preferences
-- Remove all email notification options except weekly newsletter
-- Make weekly newsletter automatically enabled for all users

-- Update the get_neighborhood_emails_for_digest function to use simplified structure
CREATE OR REPLACE FUNCTION public.get_neighborhood_emails_for_digest(target_neighborhood_id uuid)
RETURNS TABLE(user_id uuid, email text, display_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    au.email::text as email,
    p.display_name
  FROM profiles p
  JOIN auth.users au ON p.id = au.id
  WHERE p.id IN (
    -- Get active neighborhood members
    SELECT nm.user_id 
    FROM neighborhood_members nm 
    WHERE nm.neighborhood_id = target_neighborhood_id 
      AND nm.status = 'active'
    UNION
    -- Get neighborhood creator
    SELECT n.created_by
    FROM neighborhoods n
    WHERE n.id = target_neighborhood_id
  )
  -- Check if weekly newsletter is enabled (simplified check)
  AND (
    -- Check if user has weekly_summary enabled in their preferences
    (p.notification_preferences->'email'->'types'->>'weekly_summary')::boolean = true
    -- OR if they don't have preferences set (default to enabled)
    OR p.notification_preferences->'email'->'types'->>'weekly_summary' IS NULL
  );
END;
$function$;

-- Update existing users to have weekly newsletter enabled by default
UPDATE profiles 
SET notification_preferences = jsonb_set(
  notification_preferences,
  '{email,types,weekly_summary}',
  'true'::jsonb,
  true
)
WHERE notification_preferences->'email'->'types'->>'weekly_summary' IS NULL
   OR (notification_preferences->'email'->'types'->>'weekly_summary')::boolean = false;

-- Update the default notification_preferences structure for new users
ALTER TABLE profiles 
ALTER COLUMN notification_preferences 
SET DEFAULT jsonb_build_object(
  'in_app', jsonb_build_object(
    'involved_only', true,
    'page_specific', jsonb_build_object(
      'events', true,
      'safety', true,
      'care', true,
      'goods', true,
      'skills', true,
      'neighbors', true
    ),
    'all_activity', false,
    'new_neighbors', true
  ),
  'email', jsonb_build_object(
    'enabled', true,  -- Keep enabled for backward compatibility
    'frequency', 'weekly',
    'types', jsonb_build_object(
      'weekly_summary', true  -- Only keep weekly summary, enable by default
    )
  )
);

-- Update existing users to have the simplified email structure
UPDATE profiles 
SET notification_preferences = jsonb_set(
  notification_preferences,
  '{email,types}',
  jsonb_build_object(
    'weekly_summary', COALESCE(
      (notification_preferences->'email'->'types'->>'weekly_summary')::boolean,
      true  -- Default to true if not set
    )
  ),
  true
)
WHERE notification_preferences->'email'->'types' IS NOT NULL;

-- Update the should_user_receive_email_notification function for simplified structure
CREATE OR REPLACE FUNCTION should_user_receive_email_notification(
  p_user_id UUID,
  p_notification_type TEXT,
  p_content_type TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_prefs JSONB;
  type_enabled BOOLEAN;
BEGIN
  -- Get user's notification preferences
  SELECT notification_preferences INTO user_prefs
  FROM profiles
  WHERE id = p_user_id;
  
  -- If no preferences found, default to true for weekly_summary
  IF user_prefs IS NULL THEN
    RETURN p_notification_type = 'weekly_summary';
  END IF;
  
  -- For weekly_summary, check if it's enabled (default to true if not set)
  IF p_notification_type = 'weekly_summary' THEN
    type_enabled := COALESCE(
      (user_prefs->'email'->'types'->>'weekly_summary')::boolean,
      true  -- Default to enabled
    );
    RETURN type_enabled;
  END IF;
  
  -- For all other notification types, return false (they're removed)
  RETURN FALSE;
END;
$$;
