-- Update the super admin neighborhood creation function to remove auto-membership
-- Super admins now create neighborhoods but remain as observers
CREATE OR REPLACE FUNCTION public.create_neighborhood_as_super_admin_with_options(
  neighborhood_name text,
  neighborhood_city text DEFAULT NULL::text,
  neighborhood_state text DEFAULT NULL::text,
  neighborhood_address text DEFAULT NULL::text,
  neighborhood_timezone text DEFAULT 'America/Los_Angeles'::text
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
  
  -- Create the neighborhood (super admin becomes creator but NOT member)
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
  
  -- NOTE: Super admins are NOT automatically added as members
  -- They can observe as "ghost admins" but need to explicitly join to participate
  
  RETURN new_neighborhood_id;
END;
$function$;