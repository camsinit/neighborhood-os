
-- Fix skills_exchange RLS policies to ensure consistent neighborhood filtering
-- Remove the overly permissive global policy that's causing inconsistent visibility

-- First, let's see what policies currently exist (for reference)
-- DROP POLICY IF EXISTS "Users can view skills" ON skills_exchange;
-- DROP POLICY IF EXISTS "Neighborhood skills visibility" ON skills_exchange;
-- DROP POLICY IF EXISTS "Anyone can view skills" ON skills_exchange;

-- Remove the problematic global policy that allows all authenticated users to see all skills
DROP POLICY IF EXISTS "Users can view skills" ON skills_exchange;

-- Keep the neighborhood-based filtering policy (this should already exist)
-- This policy ensures users can only see skills from neighborhoods they belong to
CREATE POLICY IF NOT EXISTS "Neighborhood skills visibility" ON skills_exchange
  FOR SELECT
  USING (
    neighborhood_id IN (
      SELECT neighborhood_id 
      FROM neighborhood_members 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
    OR 
    neighborhood_id IN (
      SELECT id 
      FROM neighborhoods 
      WHERE created_by = auth.uid()
    )
  );

-- Keep the basic filtering policy for non-archived skills
CREATE POLICY IF NOT EXISTS "Anyone can view non-archived skills" ON skills_exchange
  FOR SELECT
  USING (is_archived = false);

-- Ensure users can insert skills into neighborhoods they belong to
CREATE POLICY IF NOT EXISTS "Users can create skills in their neighborhoods" ON skills_exchange
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND (
      neighborhood_id IN (
        SELECT neighborhood_id 
        FROM neighborhood_members 
        WHERE user_id = auth.uid() 
        AND status = 'active'
      )
      OR 
      neighborhood_id IN (
        SELECT id 
        FROM neighborhoods 
        WHERE created_by = auth.uid()
      )
    )
  );

-- Ensure users can update their own skills
CREATE POLICY IF NOT EXISTS "Users can update their own skills" ON skills_exchange
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Ensure users can delete their own skills
CREATE POLICY IF NOT EXISTS "Users can delete their own skills" ON skills_exchange
  FOR DELETE
  USING (user_id = auth.uid());

-- Add a comment explaining the fix
COMMENT ON TABLE skills_exchange IS 'RLS policies updated to ensure consistent neighborhood filtering - removed global access policy that was causing visibility inconsistencies';
