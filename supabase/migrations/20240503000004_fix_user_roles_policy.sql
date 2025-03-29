
-- Drop existing problematic policies on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON user_roles;

-- Create non-recursive policies for user_roles
-- Users can view their own roles (simple equality check)
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Use a security definer function for the admin check instead of a recursive policy
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = user_uuid
    AND role = 'super_admin'::user_role
  );
END;
$$;

-- Super admins can manage all roles
CREATE POLICY "Super admins can manage all roles" ON user_roles
  FOR ALL USING (public.is_super_admin(auth.uid()));
