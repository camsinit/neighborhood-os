-- Fix Group Creator Trigger
-- This migration fixes the trigger that automatically adds the group creator as owner
-- by making it SECURITY DEFINER so it can bypass RLS policies

-- Drop and recreate the trigger function with SECURITY DEFINER
DROP TRIGGER IF EXISTS trigger_add_group_creator_as_owner ON groups;
DROP FUNCTION IF EXISTS add_group_creator_as_owner();

CREATE OR REPLACE FUNCTION add_group_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_add_group_creator_as_owner
  AFTER INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION add_group_creator_as_owner();
