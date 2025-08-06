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