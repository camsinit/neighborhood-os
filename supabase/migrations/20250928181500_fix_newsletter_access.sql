-- Fix Newsletter Access Issues
-- The security migration was too restrictive and prevented the newsletter system from working
-- This migration adds the necessary policies for the newsletter functions to operate

-- =============================================================================
-- STEP 1: Add read access to neighborhoods table for authenticated users
-- =============================================================================

-- Drop policy first if it exists to avoid duplicates
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'neighborhoods'
    AND policyname = 'Users can view their neighborhoods'
  ) THEN
    EXECUTE 'DROP POLICY "Users can view their neighborhoods" ON public.neighborhoods';
  END IF;
END $$;

-- Allow authenticated users to read neighborhoods they're members of
CREATE POLICY "Users can view their neighborhoods"
ON public.neighborhoods
FOR SELECT
TO authenticated
USING (
  -- Users can view neighborhoods they're members of
  EXISTS (
    SELECT 1 FROM public.neighborhood_members nm
    WHERE nm.neighborhood_id = public.neighborhoods.id
      AND nm.user_id = (SELECT auth.uid())
      AND nm.status = 'active'
  )
  OR
  -- Users can view neighborhoods they created
  created_by = (SELECT auth.uid())
  OR
  -- Super admins can view all neighborhoods
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role = 'super_admin'::public.user_role
  )
);

-- Grant basic select permission
GRANT SELECT ON public.neighborhoods TO authenticated;

-- =============================================================================
-- STEP 2: Fix the get_neighborhood_emails_for_digest function permissions
-- =============================================================================

-- This function needs to be callable by the edge functions (service role)
GRANT EXECUTE ON FUNCTION public.get_neighborhood_emails_for_digest(uuid) TO service_role;

-- =============================================================================
-- STEP 3: Ensure the newsletter edge functions can work
-- =============================================================================

-- The send-weekly-summary-final function needs to access these
GRANT SELECT ON public.neighborhoods TO service_role;
GRANT SELECT ON public.profiles TO service_role;
GRANT SELECT ON public.neighborhood_members TO service_role;
GRANT SELECT ON public.invitations TO service_role;
GRANT ALL ON public.email_queue TO service_role;

-- =============================================================================
-- STEP 4: Fix the profiles table access for the newsletter system
-- =============================================================================

-- Drop policy first if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'profiles'
    AND policyname = 'Service role can read profiles'
  ) THEN
    EXECUTE 'DROP POLICY "Service role can read profiles" ON public.profiles';
  END IF;
END $$;

-- Add a policy that allows service role to read all profiles
-- This is needed for the newsletter generation
CREATE POLICY "Service role can read profiles"
ON public.profiles
FOR SELECT
TO service_role
USING (true);

-- =============================================================================
-- STEP 5: Ensure RLS is enabled but with proper policies
-- =============================================================================

ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 6: Log the fix
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Newsletter access issues fixed';
  RAISE NOTICE 'Service role now has proper permissions for newsletter generation';
  RAISE NOTICE 'Authenticated users can view their neighborhoods';
END $$;