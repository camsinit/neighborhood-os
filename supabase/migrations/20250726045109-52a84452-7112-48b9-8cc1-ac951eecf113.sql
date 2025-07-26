-- Create a special function for super admins to create neighborhoods without restrictions
CREATE OR REPLACE FUNCTION public.create_neighborhood_as_super_admin(
  neighborhood_name text,
  neighborhood_city text DEFAULT NULL,
  neighborhood_state text DEFAULT NULL,
  neighborhood_address text DEFAULT NULL,
  neighborhood_timezone text DEFAULT 'America/Los_Angeles'
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
  
  -- Create the neighborhood (bypass normal restrictions for super admins)
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
  
  -- Auto-assign the super admin as neighborhood admin
  INSERT INTO neighborhood_roles (user_id, neighborhood_id, role, assigned_by)
  VALUES (admin_user_id, new_neighborhood_id, 'admin', admin_user_id);
  
  RETURN new_neighborhood_id;
END;
$function$;