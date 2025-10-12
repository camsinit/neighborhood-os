-- Only Active Members Receive Newsletter
-- Remove automatic newsletter sending to neighborhood creators
-- Creators must be active members to receive newsletters

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
  LEFT JOIN auth.users au ON p.id = au.id
  WHERE p.id IN (
    -- Get active neighborhood members ONLY (no longer including creators automatically)
    SELECT nm.user_id
    FROM neighborhood_members nm
    WHERE nm.neighborhood_id = target_neighborhood_id
      AND nm.status = 'active'
  )
  -- Check if weekly newsletter is enabled
  AND (
    -- Check if user has weekly_summary enabled in their preferences
    (p.notification_preferences->'email'->'types'->>'weekly_summary')::boolean = true
    -- OR if they don't have preferences set (default to enabled)
    OR p.notification_preferences->'email'->'types'->>'weekly_summary' IS NULL
  )
  AND au.email IS NOT NULL;  -- Only include users with email addresses
END;
$function$;

-- Log the change
DO $$
BEGIN
  RAISE NOTICE 'Updated get_neighborhood_emails_for_digest to only include active members';
  RAISE NOTICE 'Creators must be active members to receive newsletters';
END $$;
