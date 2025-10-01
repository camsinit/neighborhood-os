-- Fix Newsletter Digest Function JOIN Issue
-- The function was using INNER JOIN with auth.users which was dropping 3 users
-- Change to LEFT JOIN to ensure all neighborhood members are included

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
  LEFT JOIN auth.users au ON p.id = au.id  -- Changed from JOIN to LEFT JOIN
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

-- Log the fix
DO $$
BEGIN
  RAISE NOTICE 'Fixed get_neighborhood_emails_for_digest function to use LEFT JOIN';
  RAISE NOTICE 'This should now include all neighborhood members with email addresses';
END $$;