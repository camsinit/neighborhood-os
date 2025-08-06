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

-- Create function to get neighborhood member emails with preferences
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
  -- Check email preferences (weekly digest enabled)
  AND (
    (p.notification_preferences->'email'->>'enabled')::boolean = true
    AND (p.notification_preferences->'email'->>'weekly_digest')::boolean = true
  );
END;
$function$

-- Create function to get neighborhoods ready for weekly digest
CREATE OR REPLACE FUNCTION public.get_neighborhoods_ready_for_digest()
RETURNS TABLE(
  neighborhood_id uuid, 
  neighborhood_name text, 
  timezone text,
  last_sent timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    n.id as neighborhood_id,
    n.name as neighborhood_name,
    n.timezone,
    n.last_weekly_digest_sent as last_sent
  FROM neighborhoods n
  WHERE 
    -- It's Sunday morning (9 AM) in the neighborhood's timezone
    EXTRACT(dow FROM (NOW() AT TIME ZONE n.timezone)) = 0  -- Sunday
    AND EXTRACT(hour FROM (NOW() AT TIME ZONE n.timezone)) = 9  -- 9 AM
    AND (
      -- Either never sent, or last sent more than 6 days ago
      n.last_weekly_digest_sent IS NULL 
      OR n.last_weekly_digest_sent < (NOW() - INTERVAL '6 days')
    );
END;
$function$