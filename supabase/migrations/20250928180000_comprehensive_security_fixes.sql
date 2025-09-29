-- COMPREHENSIVE SECURITY FIXES
-- This migration consolidates all security improvements into one clean implementation
-- Fixes: profiles access, email_queue security, RLS recursion, and function security

-- =============================================================================
-- STEP 1: CLEAN SLATE - Drop all existing security policies and functions
-- =============================================================================

-- Drop all existing policies that we're going to recreate
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view neighborhood profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view neighborhood member profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their neighborhood memberships" ON public.neighborhood_members;
DROP POLICY IF EXISTS "Secure neighborhood member access" ON public.neighborhood_members;
DROP POLICY IF EXISTS "System can manage email queue" ON public.email_queue;
DROP POLICY IF EXISTS "Service role can manage email queue" ON public.email_queue;
DROP POLICY IF EXISTS "Allow anonymous users to read invitations by invite_code" ON public.invitations;
DROP POLICY IF EXISTS "Users can read invitations" ON public.invitations;
DROP POLICY IF EXISTS "Authenticated users can view relevant invitations" ON public.invitations;

-- Drop functions with CASCADE to remove dependent policies
DROP FUNCTION IF EXISTS public.check_neighborhood_access(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.user_is_neighborhood_admin(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_neighborhood_role(uuid, uuid) CASCADE;

-- =============================================================================
-- STEP 2: ENSURE RLS IS ENABLED ON ALL TABLES
-- =============================================================================

ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neighborhood_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 3: SECURE EMAIL_QUEUE TABLE - Critical security fix
-- =============================================================================

CREATE POLICY "Service role can manage email queue"
ON public.email_queue
FOR ALL
TO service_role
USING (true);

-- =============================================================================
-- STEP 4: CREATE HARDENED SECURITY DEFINER FUNCTIONS - Prevent RLS recursion
-- =============================================================================

-- Main neighborhood access check function
CREATE OR REPLACE FUNCTION public.check_neighborhood_access(target_neighborhood_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    -- User is an active member of the neighborhood
    SELECT 1
    FROM public.neighborhood_members nm
    WHERE nm.neighborhood_id = target_neighborhood_id
      AND nm.user_id = auth.uid()
      AND nm.status = 'active'
    UNION
    -- User created the neighborhood
    SELECT 1
    FROM public.neighborhoods n
    WHERE n.id = target_neighborhood_id
      AND n.created_by = auth.uid()
    UNION
    -- User is a super admin
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'super_admin'::public.user_role
  );
$$;

-- Revoke execute permissions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.check_neighborhood_access(uuid) FROM anon, authenticated;

-- Super admin check function
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role = 'super_admin'::public.user_role
  );
$$;

-- Revoke execute permissions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM anon, authenticated;

-- Neighborhood admin check function
CREATE OR REPLACE FUNCTION public.user_is_neighborhood_admin(_user uuid, _neighborhood uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (
    -- Neighborhood creator is implicitly admin
    EXISTS (
      SELECT 1 FROM public.neighborhoods n
      WHERE n.id = _neighborhood AND n.created_by = _user
    )
    OR
    -- Explicit admin role in neighborhood_roles
    EXISTS (
      SELECT 1 FROM public.neighborhood_roles nr
      WHERE nr.neighborhood_id = _neighborhood AND nr.user_id = _user AND nr.role = 'admin'
    )
    OR
    -- Global super admin
    public.is_super_admin(_user)
  );
$$;

-- Revoke execute permissions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.user_is_neighborhood_admin(uuid, uuid) FROM anon, authenticated;

-- User neighborhood role function
CREATE OR REPLACE FUNCTION public.get_user_neighborhood_role(user_uuid uuid, neighborhood_uuid uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role TEXT;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.neighborhoods
    WHERE id = neighborhood_uuid AND created_by = user_uuid
  ) THEN
    RETURN 'admin';
  END IF;

  SELECT role INTO user_role
  FROM public.neighborhood_roles
  WHERE user_id = user_uuid AND neighborhood_id = neighborhood_uuid;

  IF user_role IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.neighborhood_members
      WHERE user_id = user_uuid
      AND neighborhood_id = neighborhood_uuid
      AND status = 'active'
    ) THEN
      RETURN 'neighbor';
    END IF;
  END IF;

  RETURN COALESCE(user_role, 'neighbor');
END;
$$;

-- Revoke execute permissions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.get_user_neighborhood_role(uuid, uuid) FROM anon, authenticated;

-- =============================================================================
-- STEP 5: CREATE SECURE POLICIES - Neighborhood-based access control
-- =============================================================================

-- Profiles table - secure neighborhood-based access
CREATE POLICY "Users can view neighborhood member profiles"
ON public.profiles
FOR SELECT
USING (
  -- Users can always view their own profile
  (SELECT auth.uid()) = id
  OR
  -- Users can view profiles of other users in their neighborhoods
  (
    (SELECT auth.uid()) IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.neighborhood_members nm1
      JOIN public.neighborhood_members nm2 ON nm1.neighborhood_id = nm2.neighborhood_id
      WHERE nm1.user_id = (SELECT auth.uid())
        AND nm1.status = 'active'
        AND nm2.user_id = public.profiles.id
        AND nm2.status = 'active'
    )
  )
  OR
  -- Users can view profiles of users in neighborhoods they created
  (
    (SELECT auth.uid()) IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.neighborhoods n
      JOIN public.neighborhood_members nm ON n.id = nm.neighborhood_id
      WHERE n.created_by = (SELECT auth.uid())
        AND nm.user_id = public.profiles.id
        AND nm.status = 'active'
    )
  )
  OR
  -- Super admins can view all profiles
  (
    (SELECT auth.uid()) IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = (SELECT auth.uid())
        AND ur.role = 'super_admin'::public.user_role
    )
  )
);

-- Neighborhood members table - secure access using security definer function
CREATE POLICY "Secure neighborhood member access"
ON public.neighborhood_members
FOR SELECT
USING (
  -- Users can view their own memberships
  (SELECT auth.uid()) = user_id
  OR
  -- Use the security definer function to avoid recursion
  public.check_neighborhood_access(neighborhood_id)
);

-- Invitations table - secure neighborhood-based access
CREATE POLICY "Authenticated users can view relevant invitations"
ON public.invitations
FOR SELECT
USING (
  -- Users can view invitations they created
  (SELECT auth.uid()) = inviter_id
  OR
  -- Users can view invitations for neighborhoods they're members of
  public.check_neighborhood_access(neighborhood_id)
  OR
  -- Super admins can view all invitations
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = (SELECT auth.uid())
    AND ur.role = 'super_admin'::public.user_role
  )
);

-- =============================================================================
-- STEP 6: PERFORMANCE INDEXES
-- =============================================================================

-- Create indexes for policy performance
CREATE INDEX IF NOT EXISTS idx_neighborhood_members_user_id ON public.neighborhood_members (user_id);
CREATE INDEX IF NOT EXISTS idx_neighborhood_members_neighborhood_status ON public.neighborhood_members (neighborhood_id, status);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_created_by ON public.neighborhoods (created_by);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON public.user_roles (user_id, role);
CREATE INDEX IF NOT EXISTS idx_neighborhood_roles_multi ON public.neighborhood_roles (neighborhood_id, user_id, role);

-- =============================================================================
-- STEP 7: GRANT PRIVILEGES FOR RLS POLICIES
-- =============================================================================

-- Grant SELECT privileges to authenticated users so RLS policies can apply
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.neighborhood_members TO authenticated;
GRANT SELECT ON public.invitations TO authenticated;

-- =============================================================================
-- STEP 8: VERIFICATION AND LOGGING
-- =============================================================================

-- Log the security update
DO $$
BEGIN
  RAISE NOTICE 'Comprehensive security fixes applied successfully';
  RAISE NOTICE 'Email queue secured, RLS recursion fixed, neighborhood-based access implemented';
  RAISE NOTICE 'Performance indexes created, functions hardened with proper permissions';
END $$;