-- Ensure weekly digest is enabled for ALL existing users
-- This migration forces the weekly digest to be enabled for everyone

-- Update ALL users to have weekly digest enabled, regardless of current setting
UPDATE profiles
SET notification_preferences = jsonb_set(
  COALESCE(notification_preferences, '{}'::jsonb),
  '{email,types,weekly_summary}',
  'true'::jsonb,
  true
);

-- Also ensure the email enabled flag is set to true for backward compatibility
UPDATE profiles
SET notification_preferences = jsonb_set(
  notification_preferences,
  '{email,enabled}',
  'true'::jsonb,
  true
);

-- Update the function to ALWAYS return users for digest (removing the opt-out check)
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
  -- ALWAYS include users (no preference check - weekly digest is mandatory)
  AND au.email IS NOT NULL;  -- Only exclude if they don't have an email
END;
$function$;

-- Log the update
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count FROM profiles;
  RAISE NOTICE 'Enabled weekly digest for % users', updated_count;
END $$;