-- CRITICAL SECURITY FIX: Phase 1 - Fix privilege escalation vulnerability
-- Drop and recreate functions with proper security

-- Step 1: Drop existing insecure RLS policies on user_roles table
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;

-- Step 2: Drop existing function to recreate with proper security
DROP FUNCTION IF EXISTS public.check_user_role(uuid, user_role);

-- Step 3: Create secure check_user_role function with proper search_path
CREATE OR REPLACE FUNCTION public.check_user_role(user_uuid uuid, role_name user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid AND role = role_name
  );
END;
$$;

-- Step 4: Create secure role management functions
CREATE OR REPLACE FUNCTION public.assign_user_role(
  target_user_id UUID,
  target_role user_role,
  assigned_by_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  assigner_is_super_admin BOOLEAN := FALSE;
  assigner_is_admin BOOLEAN := FALSE;
BEGIN
  -- Check if the assigner has super_admin role
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = assigned_by_user_id AND role = 'super_admin'
  ) INTO assigner_is_super_admin;
  
  -- Check if the assigner has admin role  
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = assigned_by_user_id AND role = 'admin'
  ) INTO assigner_is_admin;
  
  -- Only super_admins can assign super_admin role
  IF target_role = 'super_admin' AND NOT assigner_is_super_admin THEN
    RAISE EXCEPTION 'Only super administrators can assign super_admin role';
  END IF;
  
  -- Only super_admins or admins can assign admin role
  IF target_role = 'admin' AND NOT (assigner_is_super_admin OR assigner_is_admin) THEN
    RAISE EXCEPTION 'Only administrators can assign admin role';
  END IF;
  
  -- Only authenticated users with proper roles can assign any role
  IF NOT (assigner_is_super_admin OR assigner_is_admin) THEN
    RAISE EXCEPTION 'Insufficient privileges to assign roles';
  END IF;
  
  -- Insert the role (use INSERT with ON CONFLICT for safety)
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, target_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log the role assignment for audit purposes
  RAISE LOG 'Role % assigned to user % by user %', target_role, target_user_id, assigned_by_user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Failed to assign role: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Step 5: Create secure role removal function
CREATE OR REPLACE FUNCTION public.remove_user_role(
  target_user_id UUID,
  target_role user_role,
  removed_by_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  remover_is_super_admin BOOLEAN := FALSE;
  remover_is_admin BOOLEAN := FALSE;
BEGIN
  -- Check remover's privileges
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = removed_by_user_id AND role = 'super_admin'
  ) INTO remover_is_super_admin;
  
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = removed_by_user_id AND role = 'admin'
  ) INTO remover_is_admin;
  
  -- Only super_admins can remove super_admin role
  IF target_role = 'super_admin' AND NOT remover_is_super_admin THEN
    RAISE EXCEPTION 'Only super administrators can remove super_admin role';
  END IF;
  
  -- Only super_admins or admins can remove admin role
  IF target_role = 'admin' AND NOT (remover_is_super_admin OR remover_is_admin) THEN
    RAISE EXCEPTION 'Only administrators can remove admin role';
  END IF;
  
  -- Only authenticated users with proper roles can remove any role
  IF NOT (remover_is_super_admin OR remover_is_admin) THEN
    RAISE EXCEPTION 'Insufficient privileges to remove roles';
  END IF;
  
  -- Remove the role
  DELETE FROM user_roles 
  WHERE user_id = target_user_id AND role = target_role;
  
  -- Log the role removal for audit purposes
  RAISE LOG 'Role % removed from user % by user %', target_role, target_user_id, removed_by_user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Failed to remove role: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Step 6: Create new secure RLS policies for user_roles (admin-only access)
CREATE POLICY "Only admins can insert roles" ON public.user_roles
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'admin')
  )
);

CREATE POLICY "Only admins can update roles" ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'admin')
  )
);

CREATE POLICY "Only admins can delete roles" ON public.user_roles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('super_admin', 'admin')
  )
);