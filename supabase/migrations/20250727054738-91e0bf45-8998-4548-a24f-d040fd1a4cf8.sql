-- Add function for super admins to voluntarily join as actual members
-- This allows them to participate in the community when desired
CREATE OR REPLACE FUNCTION public.join_neighborhood_as_super_admin(neighborhood_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_user_id uuid;
  already_member BOOLEAN;
BEGIN
  -- Get the current user ID
  admin_user_id := auth.uid();
  
  -- Verify the user is a super admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = admin_user_id 
    AND role = 'super_admin'::user_role
  ) THEN
    RAISE EXCEPTION 'Only super admins can use this function';
  END IF;
  
  -- Check if already a member
  SELECT is_actual_member(admin_user_id, neighborhood_uuid) INTO already_member;
  
  IF already_member THEN
    RETURN TRUE; -- Already a member
  END IF;
  
  -- Add as active member
  INSERT INTO neighborhood_members (user_id, neighborhood_id, status, joined_at)
  VALUES (admin_user_id, neighborhood_uuid, 'active', now())
  ON CONFLICT DO NOTHING;
  
  RETURN TRUE;
END;
$function$;