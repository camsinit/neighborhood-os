
-- This function helps diagnose RLS issues by checking if the auth context is properly set
CREATE OR REPLACE FUNCTION public.check_auth_context()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN jsonb_build_object(
    'user_id', auth.uid(),
    'role', auth.role(),
    'is_authenticated', auth.role() = 'authenticated',
    'timestamp', now()
  );
END;
$$;

-- Add a comment to explain the function
COMMENT ON FUNCTION public.check_auth_context() IS 'Helper function to verify authentication context is working properly for RLS';
