-- Implement Invisible Super Admin Access
-- Update check_neighborhood_access to grant super admins universal access
CREATE OR REPLACE FUNCTION public.check_neighborhood_access(neighborhood_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Super admins have access to all neighborhoods
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'::user_role
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Regular access checks (membership or creation)
  RETURN EXISTS (
    SELECT 1 FROM neighborhood_members nm
    WHERE nm.user_id = auth.uid() 
      AND nm.neighborhood_id = check_neighborhood_access.neighborhood_id
      AND nm.status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM neighborhoods n
    WHERE n.created_by = auth.uid()
      AND n.id = check_neighborhood_access.neighborhood_id
  );
END;
$$;

-- Update is_user_in_neighborhood for consistency with super admin access
CREATE OR REPLACE FUNCTION public.is_user_in_neighborhood(user_uuid uuid, neighborhood_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Super admins have access to all neighborhoods
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid 
    AND role = 'super_admin'::user_role
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Regular access checks
  RETURN EXISTS (
    SELECT 1 FROM neighborhood_members
    WHERE user_id = user_uuid AND neighborhood_id = neighborhood_uuid AND status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM neighborhoods
    WHERE id = neighborhood_uuid AND created_by = user_uuid
  );
END;
$$;