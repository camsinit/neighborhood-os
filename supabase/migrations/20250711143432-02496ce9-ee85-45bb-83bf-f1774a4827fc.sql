-- Phase 1: Database Schema & Role Foundation Updates

-- Step 1: Update the user_role enum to include new roles
-- First, add the new 'steward' and 'neighbor' roles to the enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'steward';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'neighbor';

-- Step 2: Create neighborhood_roles table for neighborhood-scoped permissions
CREATE TABLE IF NOT EXISTS neighborhood_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'steward')),
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one user can only have one role per neighborhood
  UNIQUE(user_id, neighborhood_id)
);

-- Step 3: Enable RLS on neighborhood_roles table
ALTER TABLE neighborhood_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for neighborhood_roles
CREATE POLICY "Users can view their own neighborhood roles"
ON neighborhood_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Neighborhood admins can view all roles in their neighborhoods"
ON neighborhood_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM neighborhood_roles nr
    WHERE nr.neighborhood_id = neighborhood_roles.neighborhood_id
    AND nr.user_id = auth.uid()
    AND nr.role = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM neighborhoods n
    WHERE n.id = neighborhood_roles.neighborhood_id
    AND n.created_by = auth.uid()
  )
);

CREATE POLICY "Neighborhood admins can assign steward roles"
ON neighborhood_roles
FOR INSERT
WITH CHECK (
  role = 'steward'
  AND (
    EXISTS (
      SELECT 1 FROM neighborhood_roles nr
      WHERE nr.neighborhood_id = neighborhood_roles.neighborhood_id
      AND nr.user_id = auth.uid()
      AND nr.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM neighborhoods n
      WHERE n.id = neighborhood_roles.neighborhood_id
      AND n.created_by = auth.uid()
    )
  )
);

CREATE POLICY "Neighborhood admins can update roles"
ON neighborhood_roles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM neighborhood_roles nr
    WHERE nr.neighborhood_id = neighborhood_roles.neighborhood_id
    AND nr.user_id = auth.uid()
    AND nr.role = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM neighborhoods n
    WHERE n.id = neighborhood_roles.neighborhood_id
    AND n.created_by = auth.uid()
  )
);

CREATE POLICY "Neighborhood admins can remove steward roles"
ON neighborhood_roles
FOR DELETE
USING (
  role = 'steward'
  AND (
    EXISTS (
      SELECT 1 FROM neighborhood_roles nr
      WHERE nr.neighborhood_id = neighborhood_roles.neighborhood_id
      AND nr.user_id = auth.uid()
      AND nr.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM neighborhoods n
      WHERE n.id = neighborhood_roles.neighborhood_id
      AND n.created_by = auth.uid()
    )
  )
);

-- Step 5: Create function to automatically assign admin role to neighborhood creators
CREATE OR REPLACE FUNCTION assign_neighborhood_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Assign admin role to the neighborhood creator
  INSERT INTO neighborhood_roles (user_id, neighborhood_id, role, assigned_by)
  VALUES (NEW.created_by, NEW.id, 'admin', NEW.created_by);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create trigger to automatically assign admin role when neighborhood is created
DROP TRIGGER IF EXISTS on_neighborhood_created ON neighborhoods;
CREATE TRIGGER on_neighborhood_created
  AFTER INSERT ON neighborhoods
  FOR EACH ROW
  EXECUTE FUNCTION assign_neighborhood_admin_role();

-- Step 7: Create function to get user's role in a specific neighborhood
CREATE OR REPLACE FUNCTION get_user_neighborhood_role(user_uuid UUID, neighborhood_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check if user is the neighborhood creator (automatic admin)
  IF EXISTS (
    SELECT 1 FROM neighborhoods 
    WHERE id = neighborhood_uuid AND created_by = user_uuid
  ) THEN
    RETURN 'admin';
  END IF;
  
  -- Check neighborhood_roles table for explicit role assignment
  SELECT role INTO user_role
  FROM neighborhood_roles
  WHERE user_id = user_uuid AND neighborhood_id = neighborhood_uuid;
  
  -- If no explicit role found, check if they're a member (default to 'neighbor')
  IF user_role IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM neighborhood_members
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

-- Step 8: Migrate existing neighborhood creators to have admin role
INSERT INTO neighborhood_roles (user_id, neighborhood_id, role, assigned_by)
SELECT 
  created_by as user_id,
  id as neighborhood_id,
  'admin' as role,
  created_by as assigned_by
FROM neighborhoods
WHERE created_by IS NOT NULL
ON CONFLICT (user_id, neighborhood_id) DO NOTHING;

-- Step 9: Update existing user roles to use 'neighbor' instead of 'user' where appropriate
-- This updates the global user_roles table for users who don't have special system roles
UPDATE user_roles 
SET role = 'neighbor'::user_role 
WHERE role = 'user'::user_role;

-- Step 10: Create index for performance
CREATE INDEX IF NOT EXISTS idx_neighborhood_roles_user_neighborhood 
ON neighborhood_roles(user_id, neighborhood_id);

CREATE INDEX IF NOT EXISTS idx_neighborhood_roles_neighborhood 
ON neighborhood_roles(neighborhood_id);

-- Step 11: Add updated_at trigger for neighborhood_roles
CREATE OR REPLACE FUNCTION update_neighborhood_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER neighborhood_roles_updated_at
  BEFORE UPDATE ON neighborhood_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_neighborhood_roles_updated_at();