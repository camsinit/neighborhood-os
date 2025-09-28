-- Fix security vulnerability: Restrict profiles table access to authenticated users only
-- Remove dangerous public access policies and replace with secure neighborhood-based access

-- Drop all existing overly permissive policies on profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profile info" ON public.profiles;

-- Drop existing policies that might reference the function
DROP POLICY IF EXISTS "Users can view neighborhood profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their neighborhood memberships" ON public.neighborhood_members;

-- Drop existing function with CASCADE
DROP FUNCTION IF EXISTS public.check_neighborhood_access(uuid) CASCADE;

-- Create secure neighborhood-based access policy
-- Only allow viewing profiles of users within the same neighborhood
CREATE POLICY "Users can view neighborhood member profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can always view their own profile
  auth.uid() = id 
  OR
  -- Users can view profiles of other users in their neighborhoods
  (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 
      FROM neighborhood_members nm1
      JOIN neighborhood_members nm2 ON nm1.neighborhood_id = nm2.neighborhood_id
      WHERE nm1.user_id = auth.uid() 
        AND nm1.status = 'active'
        AND nm2.user_id = profiles.id
        AND nm2.status = 'active'
    )
  )
  OR
  -- Users can view profiles of users in neighborhoods they created
  (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM neighborhoods n
      JOIN neighborhood_members nm ON n.id = nm.neighborhood_id
      WHERE n.created_by = auth.uid()
        AND nm.user_id = profiles.id
        AND nm.status = 'active'
    )
  )
  OR
  -- Super admins can view all profiles
  (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 
      FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
        AND ur.role = 'super_admin'::user_role
    )
  )
);

-- Recreate necessary policies for neighborhood_members
CREATE POLICY "Users can view their neighborhood memberships" 
ON public.neighborhood_members 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 
    FROM neighborhood_members nm
    WHERE nm.neighborhood_id = neighborhood_members.neighborhood_id
      AND nm.user_id = auth.uid() 
      AND nm.status = 'active'
  )
  OR
  EXISTS (
    SELECT 1
    FROM neighborhoods n
    WHERE n.id = neighborhood_members.neighborhood_id
      AND n.created_by = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
      AND ur.role = 'super_admin'::user_role
  )
);

-- Recreate the security definer function to check neighborhood access
-- This prevents RLS recursion issues
CREATE OR REPLACE FUNCTION public.check_neighborhood_access(target_neighborhood_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- User is an active member of the neighborhood
    SELECT 1 
    FROM neighborhood_members nm
    WHERE nm.neighborhood_id = target_neighborhood_id
      AND nm.user_id = auth.uid()
      AND nm.status = 'active'
    UNION
    -- User created the neighborhood
    SELECT 1
    FROM neighborhoods n
    WHERE n.id = target_neighborhood_id
      AND n.created_by = auth.uid()
    UNION
    -- User is a super admin
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'super_admin'::user_role
  );
$$;