-- Create function for super admin neighborhood creation with membership control
CREATE OR REPLACE FUNCTION public.create_neighborhood_as_super_admin_with_options(
  neighborhood_name text,
  neighborhood_city text DEFAULT NULL::text,
  neighborhood_state text DEFAULT NULL::text,
  neighborhood_address text DEFAULT NULL::text,
  neighborhood_timezone text DEFAULT 'America/Los_Angeles'::text,
  join_as_member boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_neighborhood_id uuid;
  admin_user_id uuid;
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
  
  -- Create the neighborhood
  INSERT INTO neighborhoods (
    name,
    city,
    state,
    address,
    timezone,
    created_by
  ) VALUES (
    neighborhood_name,
    neighborhood_city,
    neighborhood_state,
    neighborhood_address,
    neighborhood_timezone,
    admin_user_id
  ) RETURNING id INTO new_neighborhood_id;
  
  -- Only add super admin as member if join_as_member is true
  IF join_as_member THEN
    INSERT INTO neighborhood_members (user_id, neighborhood_id, status)
    VALUES (admin_user_id, new_neighborhood_id, 'active');
  END IF;
  
  RETURN new_neighborhood_id;
END;
$function$