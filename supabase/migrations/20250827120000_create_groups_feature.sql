-- Groups Feature: Initial Database Setup
-- This migration creates the core groups functionality for neighborhood organization

-- First, add physical unit configuration to neighborhoods table
ALTER TABLE neighborhoods 
ADD COLUMN physical_unit_type text 
  CHECK (physical_unit_type IN ('street', 'floor', 'block', 'custom')),
ADD COLUMN physical_unit_label text,
ADD COLUMN physical_units jsonb DEFAULT '[]'::jsonb;

-- Update existing neighborhoods with default values (streets as most common)
UPDATE neighborhoods 
SET 
  physical_unit_type = 'street',
  physical_unit_label = 'Street',
  physical_units = '[]'::jsonb
WHERE physical_unit_type IS NULL;

-- Make physical_unit_type NOT NULL after setting defaults
ALTER TABLE neighborhoods 
ALTER COLUMN physical_unit_type SET NOT NULL,
ALTER COLUMN physical_unit_label SET NOT NULL;

-- Create groups table
CREATE TABLE groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  neighborhood_id uuid NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(name) >= 2 AND length(name) <= 50),
  description text CHECK (length(description) <= 500),
  group_type text NOT NULL CHECK (group_type IN ('physical', 'social')),
  physical_unit_value text, -- Only for physical groups: "Oak Street", "Floor 2", etc.
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'suspended')),
  max_members integer DEFAULT 100 CHECK (max_members > 0 AND max_members <= 500),
  is_private boolean NOT NULL DEFAULT false,
  
  -- Constraints
  CONSTRAINT unique_group_name_per_neighborhood UNIQUE (neighborhood_id, name),
  CONSTRAINT unique_physical_unit_per_neighborhood 
    UNIQUE (neighborhood_id, physical_unit_value) 
    WHERE group_type = 'physical' AND physical_unit_value IS NOT NULL,
  CONSTRAINT physical_unit_required_for_physical_groups 
    CHECK ((group_type = 'physical' AND physical_unit_value IS NOT NULL) OR group_type = 'social')
);

-- Create group membership table with roles
CREATE TABLE group_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'moderator', 'member')),
  joined_at timestamptz DEFAULT now(),
  invited_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT unique_group_membership UNIQUE (group_id, user_id)
);

-- Create group invitations table for managing join requests to private groups
CREATE TABLE group_invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  inviter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  message text CHECK (length(message) <= 500),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  
  -- Constraints
  CONSTRAINT unique_group_invitation UNIQUE (group_id, invitee_id),
  CONSTRAINT no_self_invite CHECK (inviter_id != invitee_id)
);

-- Add group_id columns to content tables for targeting
ALTER TABLE events ADD COLUMN group_id uuid REFERENCES groups(id) ON DELETE SET NULL;
ALTER TABLE safety_updates ADD COLUMN group_id uuid REFERENCES groups(id) ON DELETE SET NULL;
ALTER TABLE activities ADD COLUMN group_id uuid REFERENCES groups(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_groups_neighborhood_id ON groups(neighborhood_id);
CREATE INDEX idx_groups_type ON groups(group_type);
CREATE INDEX idx_groups_status ON groups(status);
CREATE INDEX idx_groups_created_by ON groups(created_by);

CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_role ON group_members(role);

CREATE INDEX idx_group_invitations_group_id ON group_invitations(group_id);
CREATE INDEX idx_group_invitations_invitee_id ON group_invitations(invitee_id);
CREATE INDEX idx_group_invitations_status ON group_invitations(status);
CREATE INDEX idx_group_invitations_expires_at ON group_invitations(expires_at);

CREATE INDEX idx_events_group_id ON events(group_id);
CREATE INDEX idx_safety_updates_group_id ON safety_updates(group_id);
CREATE INDEX idx_activities_group_id ON activities(group_id);

-- Enable RLS on new tables
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for groups table
CREATE POLICY "groups_select" ON groups
FOR SELECT USING (
  -- Users can see groups in their neighborhood
  EXISTS (
    SELECT 1 FROM neighborhood_members nm
    WHERE nm.neighborhood_id = groups.neighborhood_id
    AND nm.user_id = auth.uid()
    AND nm.status = 'active'
  )
);

CREATE POLICY "groups_insert_any_member" ON groups
FOR INSERT WITH CHECK (
  -- Any neighborhood member can create groups
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM neighborhood_members nm
    WHERE nm.neighborhood_id = groups.neighborhood_id
    AND nm.user_id = auth.uid()
    AND nm.status = 'active'
  )
);

CREATE POLICY "groups_update" ON groups
FOR UPDATE USING (
  -- Group owners/moderators or neighborhood admins can update
  (created_by = auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = groups.id
    AND gm.user_id = auth.uid()
    AND gm.role IN ('owner', 'moderator')
  )) OR
  (EXISTS (
    SELECT 1 FROM neighborhood_roles nr
    WHERE nr.neighborhood_id = groups.neighborhood_id
    AND nr.user_id = auth.uid()
    AND nr.role IN ('admin', 'steward')
  ))
);

CREATE POLICY "groups_delete" ON groups
FOR DELETE USING (
  -- Only group owners or neighborhood admins can delete
  (created_by = auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM neighborhood_roles nr
    WHERE nr.neighborhood_id = groups.neighborhood_id
    AND nr.user_id = auth.uid()
    AND nr.role IN ('admin', 'steward')
  ))
);

-- Create RLS policies for group_members table
CREATE POLICY "group_members_select" ON group_members
FOR SELECT USING (
  -- Members can see other members in their groups
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM group_members gm2
    WHERE gm2.group_id = group_members.group_id
    AND gm2.user_id = auth.uid()
  ) OR
  -- Neighborhood members can see member lists for discovery
  EXISTS (
    SELECT 1 FROM groups g
    JOIN neighborhood_members nm ON nm.neighborhood_id = g.neighborhood_id
    WHERE g.id = group_members.group_id
    AND nm.user_id = auth.uid()
    AND nm.status = 'active'
  )
);

CREATE POLICY "group_members_insert" ON group_members
FOR INSERT WITH CHECK (
  -- Users can add themselves to public groups in their neighborhood
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM groups g
    JOIN neighborhood_members nm ON nm.neighborhood_id = g.neighborhood_id
    WHERE g.id = group_members.group_id
    AND nm.user_id = auth.uid()
    AND nm.status = 'active'
    AND (g.is_private = false OR EXISTS (
      -- Or they have an accepted invitation for private groups
      SELECT 1 FROM group_invitations gi
      WHERE gi.group_id = g.id
      AND gi.invitee_id = auth.uid()
      AND gi.status = 'accepted'
    ))
  )
);

CREATE POLICY "group_members_delete" ON group_members
FOR DELETE USING (
  -- Users can remove themselves, or group owners/moderators can remove others
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
    AND gm.role IN ('owner', 'moderator')
  )
);

-- Create RLS policies for group_invitations table
CREATE POLICY "group_invitations_select" ON group_invitations
FOR SELECT USING (
  -- Users can see invitations they sent or received
  inviter_id = auth.uid() OR invitee_id = auth.uid() OR
  -- Group owners/moderators can see invitations for their groups
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_invitations.group_id
    AND gm.user_id = auth.uid()
    AND gm.role IN ('owner', 'moderator')
  )
);

CREATE POLICY "group_invitations_insert" ON group_invitations
FOR INSERT WITH CHECK (
  -- Group members can invite others
  inviter_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_invitations.group_id
    AND gm.user_id = auth.uid()
  ) AND
  -- Invitee must be in the same neighborhood
  EXISTS (
    SELECT 1 FROM groups g
    JOIN neighborhood_members nm ON nm.neighborhood_id = g.neighborhood_id
    WHERE g.id = group_invitations.group_id
    AND nm.user_id = group_invitations.invitee_id
    AND nm.status = 'active'
  )
);

CREATE POLICY "group_invitations_update" ON group_invitations
FOR UPDATE USING (
  -- Invitees can respond to their invitations
  invitee_id = auth.uid() OR
  -- Inviters can update their own invitations
  inviter_id = auth.uid() OR
  -- Group owners/moderators can manage invitations
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_invitations.group_id
    AND gm.user_id = auth.uid()
    AND gm.role IN ('owner', 'moderator')
  )
);

-- Create trigger to automatically add group creator as owner
CREATE OR REPLACE FUNCTION add_group_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_add_group_creator_as_owner
  AFTER INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION add_group_creator_as_owner();

-- Create trigger to update groups.updated_at timestamp
CREATE OR REPLACE FUNCTION update_groups_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_groups_timestamp
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_groups_timestamp();

-- Add helpful database functions
CREATE OR REPLACE FUNCTION get_user_groups(user_uuid uuid, neighborhood_uuid uuid)
RETURNS TABLE(
  group_id uuid,
  group_name text,
  group_type text,
  physical_unit_value text,
  member_role text,
  member_count bigint,
  joined_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.group_type,
    g.physical_unit_value,
    gm.role,
    (SELECT count(*) FROM group_members gm2 WHERE gm2.group_id = g.id),
    gm.joined_at
  FROM groups g
  JOIN group_members gm ON gm.group_id = g.id
  WHERE gm.user_id = user_uuid
    AND g.neighborhood_id = neighborhood_uuid
    AND g.status = 'active'
  ORDER BY gm.joined_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_neighborhood_groups(neighborhood_uuid uuid)
RETURNS TABLE(
  group_id uuid,
  group_name text,
  group_type text,
  physical_unit_value text,
  description text,
  is_private boolean,
  member_count bigint,
  created_at timestamptz,
  created_by_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.group_type,
    g.physical_unit_value,
    g.description,
    g.is_private,
    (SELECT count(*) FROM group_members gm WHERE gm.group_id = g.id),
    g.created_at,
    p.display_name
  FROM groups g
  JOIN profiles p ON p.id = g.created_by
  WHERE g.neighborhood_id = neighborhood_uuid
    AND g.status = 'active'
  ORDER BY g.group_type, g.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create activity logging for group events
CREATE OR REPLACE FUNCTION log_group_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log group creation
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activities (
      actor_id,
      activity_type,
      content_id,
      content_type,
      title,
      neighborhood_id,
      group_id,
      metadata
    ) VALUES (
      NEW.created_by,
      'group_created'::activity_type,
      NEW.id::text,
      'groups',
      'Created group "' || NEW.name || '"',
      NEW.neighborhood_id,
      NEW.id,
      jsonb_build_object(
        'group_name', NEW.name,
        'group_type', NEW.group_type,
        'physical_unit_value', NEW.physical_unit_value
      )
    );
    RETURN NEW;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_group_activity
  AFTER INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION log_group_activity();

-- Create member join activity logging
CREATE OR REPLACE FUNCTION log_group_member_activity()
RETURNS TRIGGER AS $$
DECLARE
  group_name text;
  group_neighborhood_id uuid;
BEGIN
  -- Get group info for activity logging
  SELECT name, neighborhood_id INTO group_name, group_neighborhood_id
  FROM groups WHERE id = NEW.group_id;

  IF TG_OP = 'INSERT' AND NEW.role != 'owner' THEN
    -- Don't log when creator is automatically added as owner
    INSERT INTO activities (
      actor_id,
      activity_type,
      content_id,
      content_type,
      title,
      neighborhood_id,
      group_id,
      metadata
    ) VALUES (
      NEW.user_id,
      'group_joined'::activity_type,
      NEW.group_id::text,
      'groups',
      'Joined group "' || group_name || '"',
      group_neighborhood_id,
      NEW.group_id,
      jsonb_build_object(
        'group_name', group_name,
        'member_role', NEW.role
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_group_member_activity
  AFTER INSERT ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION log_group_member_activity();

-- Add validation function for physical units
CREATE OR REPLACE FUNCTION validate_physical_unit_value(
  group_neighborhood_id uuid,
  unit_value text
) RETURNS boolean AS $$
DECLARE
  available_units jsonb;
BEGIN
  -- Get available physical units for the neighborhood
  SELECT physical_units INTO available_units
  FROM neighborhoods
  WHERE id = group_neighborhood_id;
  
  -- Check if the unit value is in the available units list
  RETURN available_units ? unit_value;
END;
$$ LANGUAGE plpgsql;

-- Add constraint trigger for physical unit validation
CREATE OR REPLACE FUNCTION check_physical_unit_constraint()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate for physical groups
  IF NEW.group_type = 'physical' AND NEW.physical_unit_value IS NOT NULL THEN
    IF NOT validate_physical_unit_value(NEW.neighborhood_id, NEW.physical_unit_value) THEN
      RAISE EXCEPTION 'Physical unit "%" is not available in this neighborhood. Available units must be configured by neighborhood admin.', NEW.physical_unit_value;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_physical_unit_constraint
  BEFORE INSERT OR UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION check_physical_unit_constraint();

-- Grant appropriate permissions
GRANT SELECT ON groups TO authenticated;
GRANT INSERT ON groups TO authenticated;
GRANT UPDATE ON groups TO authenticated;
GRANT DELETE ON groups TO authenticated;

GRANT SELECT ON group_members TO authenticated;
GRANT INSERT ON group_members TO authenticated;
GRANT UPDATE ON group_members TO authenticated;
GRANT DELETE ON group_members TO authenticated;

GRANT SELECT ON group_invitations TO authenticated;
GRANT INSERT ON group_invitations TO authenticated;
GRANT UPDATE ON group_invitations TO authenticated;
GRANT DELETE ON group_invitations TO authenticated;

GRANT EXECUTE ON FUNCTION get_user_groups(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_neighborhood_groups(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_physical_unit_value(uuid, text) TO authenticated;