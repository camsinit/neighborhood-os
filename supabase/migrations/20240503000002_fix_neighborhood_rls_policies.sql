
-- Fix policies for viewing neighborhood data

-- First, clean up existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can access their neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Core contributors can access all neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Users can view neighborhoods they created" ON neighborhoods;
DROP POLICY IF EXISTS "Users can view neighborhoods they're members of" ON neighborhoods;

-- Re-create safer policies for neighborhood table
-- Allow users to access neighborhoods they created
CREATE POLICY "Users can access their created neighborhoods" ON neighborhoods
  FOR ALL USING (auth.uid() = created_by);

-- Allow users to access neighborhoods they're members of
CREATE POLICY "Users can access neighborhoods they're members of" ON neighborhoods
  FOR SELECT USING (
    id IN (
      SELECT neighborhood_id FROM neighborhood_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  );

-- Allow core contributors to access all neighborhoods
CREATE POLICY "Core contributors can access all neighborhoods" ON neighborhoods
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM core_contributors
      WHERE user_id = auth.uid()
      AND can_access_all_neighborhoods = true
    )
  );

-- Ensure RLS is enabled
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_members ENABLE ROW LEVEL SECURITY;
