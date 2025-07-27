-- Create function to check actual membership (without super admin bypass)
-- This function is used for posting/engagement permissions
CREATE OR REPLACE FUNCTION public.is_actual_member(user_uuid uuid, neighborhood_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is actual member (no super admin bypass)
  RETURN EXISTS (
    SELECT 1 FROM neighborhood_members
    WHERE user_id = user_uuid
    AND neighborhood_id = neighborhood_uuid
    AND status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM neighborhoods
    WHERE id = neighborhood_uuid
    AND created_by = user_uuid
  );
END;
$function$;