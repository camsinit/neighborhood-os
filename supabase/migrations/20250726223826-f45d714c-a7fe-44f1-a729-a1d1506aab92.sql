-- Fix unified super admin architecture: Remove conflicting role assignment from super admin function
-- Super admins use "invisible access" pattern, not explicit role records

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
AS $$
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
  
  -- NOTE: Do NOT manually assign roles here - super admins use invisible access
  -- The assign_neighborhood_admin_role trigger will create the role record automatically
  -- Super admins don't need explicit role records for access - they bypass all checks
  
  RETURN new_neighborhood_id;
END;
$$;