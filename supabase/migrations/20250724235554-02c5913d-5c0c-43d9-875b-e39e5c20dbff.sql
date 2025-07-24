-- SECURITY FIX: Final Phase - Add security audit log RLS policies and complete remaining functions

-- Add proper RLS policies for security_audit_log table (this is likely the table missing policies)
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

CREATE POLICY "System can insert audit logs" ON public.security_audit_log
FOR INSERT
WITH CHECK (true);

-- Create the log security event function with proper search_path
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

-- Complete Super Admin function that allows access to all neighborhoods
CREATE OR REPLACE FUNCTION public.get_all_neighborhoods_for_super_admin()
RETURNS TABLE(
  id uuid,
  name text,
  city text,
  state text,
  created_at timestamp with time zone,
  created_by uuid,
  member_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow super admins to call this function
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Only super administrators can access all neighborhoods';
  END IF;

  RETURN QUERY
  SELECT 
    n.id,
    n.name,
    n.city,
    n.state,
    n.created_at,
    n.created_by,
    COALESCE(member_counts.count, 0) as member_count
  FROM neighborhoods n
  LEFT JOIN (
    SELECT nm.neighborhood_id, COUNT(*) as count 
    FROM neighborhood_members nm
    WHERE nm.status = 'active' 
    GROUP BY nm.neighborhood_id
  ) member_counts ON n.id = member_counts.neighborhood_id
  ORDER BY n.created_at DESC;
END;
$$;

-- Fix any remaining SQL-based functions that might be missing search_path
CREATE OR REPLACE FUNCTION public.check_user_neighborhood_count(user_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT (
    CASE WHEN EXISTS (SELECT 1 FROM neighborhoods WHERE created_by = user_uuid) THEN 1 ELSE 0 END +
    CASE WHEN EXISTS (SELECT 1 FROM neighborhood_members WHERE user_id = user_uuid AND status = 'active') THEN 1 ELSE 0 END
  );
$$;

-- Ensure all utility functions have proper search_path
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