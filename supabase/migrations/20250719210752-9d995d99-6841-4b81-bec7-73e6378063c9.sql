
-- Phase 1: Fix Database Function Security Warnings
-- Add missing SET search_path to functions that don't have it

-- Function: check_neighborhood_limit  
CREATE OR REPLACE FUNCTION public.check_neighborhood_limit(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Check if user has reached the limit of 3 neighborhoods
  RETURN (
    SELECT COUNT(*) FROM (
      SELECT neighborhood_id FROM neighborhood_members 
      WHERE user_id = user_uuid AND status = 'active'
      UNION
      SELECT id FROM neighborhoods 
      WHERE created_by = user_uuid
    ) AS user_neighborhoods
  ) < 3;
END;
$function$;

-- Function: check_user_role
CREATE OR REPLACE FUNCTION public.check_user_role(user_uuid uuid, required_role user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid AND role = required_role
  );
END;
$function$;

-- Function: check_neighborhood_access
CREATE OR REPLACE FUNCTION public.check_neighborhood_access(neighborhood_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Check if current user has access to the neighborhood
  RETURN EXISTS (
    SELECT 1 FROM neighborhood_members nm
    WHERE nm.neighborhood_id = check_neighborhood_access.neighborhood_id
    AND nm.user_id = auth.uid()
    AND nm.status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM neighborhoods n
    WHERE n.id = check_neighborhood_access.neighborhood_id
    AND n.created_by = auth.uid()
  );
END;
$function$;

-- Function: users_share_neighborhood
CREATE OR REPLACE FUNCTION public.users_share_neighborhood(user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Check if two users share any neighborhood
  RETURN EXISTS (
    SELECT 1 FROM neighborhood_members nm1
    JOIN neighborhood_members nm2 ON nm1.neighborhood_id = nm2.neighborhood_id
    WHERE nm1.user_id = user1_id 
    AND nm2.user_id = user2_id
    AND nm1.status = 'active'
    AND nm2.status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM neighborhoods n
    JOIN neighborhood_members nm ON n.id = nm.neighborhood_id
    WHERE (n.created_by = user1_id AND nm.user_id = user2_id AND nm.status = 'active')
    OR (n.created_by = user2_id AND nm.user_id = user1_id AND nm.status = 'active')
  );
END;
$function$;

-- Add any missing core RLS functions that were referenced but not defined
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid AND role = 'super_admin'
  );
END;
$function$;

-- Function to get all neighborhoods a user has access to
CREATE OR REPLACE FUNCTION public.get_user_accessible_neighborhoods(user_uuid uuid DEFAULT auth.uid())
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN ARRAY(
    SELECT DISTINCT neighborhood_id
    FROM neighborhood_members
    WHERE user_id = user_uuid AND status = 'active'
    UNION
    SELECT DISTINCT id
    FROM neighborhoods
    WHERE created_by = user_uuid
  );
END;
$function$;

-- Simple membership check function
CREATE OR REPLACE FUNCTION public.simple_membership_check(user_uuid uuid, neighborhood_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM neighborhood_members
    WHERE user_id = user_uuid 
    AND neighborhood_id = neighborhood_uuid 
    AND status = 'active'
  );
END;
$function$;
