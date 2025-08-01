-- SECURITY FIX: Final security fixes with proper function handling

-- Create audit log table for security events first
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

-- Add proper RLS policies for security_audit_log table (only if they don't exist)
DROP POLICY IF EXISTS "Only super admins can view audit logs" ON public.security_audit_log;
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

DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_log;
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

-- Drop and recreate the super admin function with proper return type
DROP FUNCTION IF EXISTS public.get_all_neighborhoods_for_super_admin();

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