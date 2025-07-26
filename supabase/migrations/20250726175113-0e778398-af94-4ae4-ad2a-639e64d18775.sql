-- First, let's check for any existing triggers or constraints that prevent users who created neighborhoods from joining others
-- and update them to allow super admins to bypass this restriction

-- Update the add_neighborhood_member function to allow super admins to bypass the restriction
CREATE OR REPLACE FUNCTION public.add_neighborhood_member(user_uuid uuid, neighborhood_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  already_exists BOOLEAN;
  is_super_admin BOOLEAN;
BEGIN
  -- Check if user is already a member
  SELECT EXISTS (SELECT 1 FROM neighborhood_members WHERE user_id = user_uuid AND neighborhood_id = neighborhood_uuid AND status = 'active') INTO already_exists;
  IF already_exists THEN RETURN TRUE; END IF;
  
  -- Check if user is a super admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid 
    AND role = 'super_admin'::user_role
  ) INTO is_super_admin;
  
  -- If not super admin, check neighborhood limit
  IF NOT is_super_admin AND NOT public.check_neighborhood_limit(user_uuid) THEN
    RAISE EXCEPTION 'User has reached the maximum number of neighborhoods (3)';
  END IF;
  
  INSERT INTO neighborhood_members (user_id, neighborhood_id, status, joined_at) VALUES (user_uuid, neighborhood_uuid, 'active', now());
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$function$;

-- Also update the useCreateNeighborhood hook's logic by updating the check_neighborhood_limit function
-- to allow super admins to bypass the limit entirely
CREATE OR REPLACE FUNCTION public.check_neighborhood_limit(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  neighborhood_count INTEGER;
  is_super_admin BOOLEAN;
BEGIN
  -- Check if user is a super admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid 
    AND role = 'super_admin'::user_role
  ) INTO is_super_admin;
  
  -- Super admins can bypass the limit
  IF is_super_admin THEN
    RETURN TRUE;
  END IF;
  
  SELECT (
    COALESCE((SELECT COUNT(*) FROM neighborhood_members WHERE user_id = user_uuid AND status = 'active'), 0) +
    COALESCE((SELECT COUNT(*) FROM neighborhoods WHERE created_by = user_uuid), 0)
  ) INTO neighborhood_count;
  
  RETURN neighborhood_count < 3;
END;
$function$;