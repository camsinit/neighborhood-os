-- Fix Groups Foreign Key Constraints
-- This migration adds explicit names to foreign key constraints in the groups table
-- to match what the frontend code expects

-- Drop existing foreign key constraints and recreate them with explicit names
ALTER TABLE groups DROP CONSTRAINT IF EXISTS groups_neighborhood_id_fkey;
ALTER TABLE groups DROP CONSTRAINT IF EXISTS groups_created_by_fkey;

-- Recreate foreign key constraints with explicit names
ALTER TABLE groups 
ADD CONSTRAINT groups_neighborhood_id_fkey 
FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id) ON DELETE CASCADE;

ALTER TABLE groups 
ADD CONSTRAINT groups_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE RESTRICT;

-- Fix group_members foreign key constraints
ALTER TABLE group_members DROP CONSTRAINT IF EXISTS group_members_group_id_fkey;
ALTER TABLE group_members DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;
ALTER TABLE group_members DROP CONSTRAINT IF EXISTS group_members_invited_by_fkey;

ALTER TABLE group_members 
ADD CONSTRAINT group_members_group_id_fkey 
FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;

ALTER TABLE group_members 
ADD CONSTRAINT group_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE group_members 
ADD CONSTRAINT group_members_invited_by_fkey 
FOREIGN KEY (invited_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Fix group_invitations foreign key constraints
ALTER TABLE group_invitations DROP CONSTRAINT IF EXISTS group_invitations_group_id_fkey;
ALTER TABLE group_invitations DROP CONSTRAINT IF EXISTS group_invitations_inviter_id_fkey;
ALTER TABLE group_invitations DROP CONSTRAINT IF EXISTS group_invitations_invitee_id_fkey;

ALTER TABLE group_invitations 
ADD CONSTRAINT group_invitations_group_id_fkey 
FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;

ALTER TABLE group_invitations 
ADD CONSTRAINT group_invitations_inviter_id_fkey 
FOREIGN KEY (inviter_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE group_invitations 
ADD CONSTRAINT group_invitations_invitee_id_fkey 
FOREIGN KEY (invitee_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix content table foreign key constraints
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_group_id_fkey;
ALTER TABLE safety_updates DROP CONSTRAINT IF EXISTS safety_updates_group_id_fkey;
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_group_id_fkey;

ALTER TABLE events 
ADD CONSTRAINT events_group_id_fkey 
FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;

ALTER TABLE safety_updates 
ADD CONSTRAINT safety_updates_group_id_fkey 
FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;

ALTER TABLE activities 
ADD CONSTRAINT activities_group_id_fkey 
FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;
