-- CRITICAL SECURITY FIX: Prevent privilege escalation in user roles system
-- This migration addresses the most critical security vulnerabilities identified

-- Step 1: Drop existing insecure RLS policies on user_roles table
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;

-- Step 2: Create secure role management function with proper authorization
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
  
  -- Insert or update the role (upsert)
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

-- Step 3: Create secure role removal function
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

-- Step 4: Create new secure RLS policies for user_roles
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

-- Step 5: Fix existing database functions with proper search_path
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

-- Step 6: Create secure function to check neighborhood access
CREATE OR REPLACE FUNCTION public.check_neighborhood_access(neighborhood_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM neighborhood_members nm
    WHERE nm.user_id = auth.uid() 
    AND nm.neighborhood_id = neighborhood_uuid 
    AND nm.status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM neighborhoods n
    WHERE n.id = neighborhood_uuid 
    AND n.created_by = auth.uid()
  );
END;
$$;

-- Step 7: Create function to safely check if users share a neighborhood
CREATE OR REPLACE FUNCTION public.users_share_neighborhood(user1_uuid uuid, user2_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM neighborhood_members nm1
    JOIN neighborhood_members nm2 ON nm1.neighborhood_id = nm2.neighborhood_id
    WHERE nm1.user_id = user1_uuid 
    AND nm2.user_id = user2_uuid
    AND nm1.status = 'active' 
    AND nm2.status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM neighborhoods n
    WHERE n.created_by IN (user1_uuid, user2_uuid)
    AND EXISTS (
      SELECT 1 FROM neighborhood_members nm
      WHERE nm.neighborhood_id = n.id
      AND nm.user_id IN (user1_uuid, user2_uuid)
      AND nm.status = 'active'
    )
  );
END;
$$;

-- Step 8: Add check_neighborhood_limit function with proper security
CREATE OR REPLACE FUNCTION public.check_neighborhood_limit(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
DECLARE
  neighborhood_count INTEGER;
BEGIN
  -- Count active memberships + created neighborhoods
  SELECT (
    COALESCE((SELECT COUNT(*) FROM neighborhood_members WHERE user_id = user_uuid AND status = 'active'), 0) +
    COALESCE((SELECT COUNT(*) FROM neighborhoods WHERE created_by = user_uuid), 0)
  ) INTO neighborhood_count;
  
  -- Return true if under limit (3), false if at or over limit
  RETURN neighborhood_count < 3;
END;
$$;

-- Step 9: Create audit log table for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_user_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Only super admins can view audit logs" ON public.security_audit_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
);

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON public.security_audit_log
FOR INSERT
WITH CHECK (true);

-- Step 10: Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action_type TEXT,
  p_target_user_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO security_audit_log (
    user_id, 
    action_type, 
    target_user_id, 
    details
  ) VALUES (
    auth.uid(), 
    p_action_type, 
    p_target_user_id, 
    p_details
  );
END;
$$;