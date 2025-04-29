
-- This migration fixes the infinite recursion issue in neighborhood_members policies
-- by creating a more efficient policy structure that avoids self-referential queries

-- First, drop any existing RLS policies on neighborhood_members that might be causing recursion
DROP POLICY IF EXISTS "Users can view their own neighborhood memberships" ON neighborhood_members;
DROP POLICY IF EXISTS "Users can see members of their neighborhoods" ON neighborhood_members;
DROP POLICY IF EXISTS "Neighborhood creators can see all members" ON neighborhood_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON neighborhood_members;
DROP POLICY IF EXISTS "Neighborhood creators can manage memberships" ON neighborhood_members;

-- Create carefully designed policies to avoid recursion
-- 1. Users can always access their own memberships
CREATE POLICY "Users can view their own memberships" ON neighborhood_members
  FOR SELECT USING (auth.uid() = user_id);

-- 2. Neighborhood creators can manage all memberships in their neighborhoods
CREATE POLICY "Neighborhood creators can manage memberships" ON neighborhood_members
  USING (
    EXISTS (
      SELECT 1 FROM neighborhoods n
      WHERE n.oid = neighborhood_members.neighborhood_id
      AND n.created_by = auth.uid()
    )
  );

-- 3. Core contributors with access can see all neighborhoods
CREATE POLICY "Core contributors can access all memberships" ON neighborhood_members
  USING (
    EXISTS (
      SELECT 1 FROM core_contributors cc
      WHERE cc.user_id = auth.uid()
      AND cc.can_access_all_neighborhoods = true
    )
  );
