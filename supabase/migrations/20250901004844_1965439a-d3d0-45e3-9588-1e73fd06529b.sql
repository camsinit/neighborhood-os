-- Create groups and group_members tables for the Groups feature

-- Create enum for group types
CREATE TYPE group_type AS ENUM ('physical', 'social');

-- Create enum for group status
CREATE TYPE group_status AS ENUM ('active', 'archived', 'suspended');

-- Create enum for member roles
CREATE TYPE group_member_role AS ENUM ('owner', 'moderator', 'member');

-- Create groups table
CREATE TABLE public.groups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  neighborhood_id uuid NOT NULL REFERENCES public.neighborhoods(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  group_type group_type NOT NULL,
  physical_unit_value text, -- Only for physical groups
  created_by uuid NOT NULL, -- Reference to user who created the group
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status group_status NOT NULL DEFAULT 'active',
  max_members integer NOT NULL DEFAULT 100,
  is_private boolean NOT NULL DEFAULT false,
  
  -- Constraints
  CONSTRAINT groups_name_length CHECK (length(name) >= 1 AND length(name) <= 100),
  CONSTRAINT groups_max_members_positive CHECK (max_members > 0),
  CONSTRAINT groups_physical_unit_required CHECK (
    (group_type = 'physical' AND physical_unit_value IS NOT NULL) OR 
    (group_type = 'social' AND physical_unit_value IS NULL)
  )
);

-- Create group_members table
CREATE TABLE public.group_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL, -- Reference to user
  role group_member_role NOT NULL DEFAULT 'member',
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  invited_by uuid, -- Reference to user who invited them
  
  -- Unique constraint to prevent duplicate memberships
  UNIQUE(group_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_groups_neighborhood_id ON public.groups(neighborhood_id);
CREATE INDEX idx_groups_type_status ON public.groups(group_type, status);
CREATE INDEX idx_groups_created_by ON public.groups(created_by);
CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);

-- Create trigger for updated_at on groups
CREATE OR REPLACE FUNCTION update_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION update_groups_updated_at();

-- Create trigger to automatically add creator as owner member
CREATE OR REPLACE FUNCTION add_group_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Add the creator as the group owner
  INSERT INTO public.group_members (group_id, user_id, role, joined_at)
  VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_at);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_add_group_creator_as_owner
  AFTER INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION add_group_creator_as_owner();

-- Enable Row Level Security
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups table

-- Users can view groups in their neighborhoods (if they're neighborhood members)
CREATE POLICY "Users can view neighborhood groups" ON public.groups
  FOR SELECT
  USING (
    neighborhood_id IN (
      SELECT nm.neighborhood_id 
      FROM public.neighborhood_members nm 
      WHERE nm.user_id = auth.uid() 
      AND nm.status = 'active'
    )
  );

-- Users can create groups in neighborhoods they're members of
CREATE POLICY "Users can create groups in their neighborhoods" ON public.groups
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by 
    AND neighborhood_id IN (
      SELECT nm.neighborhood_id 
      FROM public.neighborhood_members nm 
      WHERE nm.user_id = auth.uid() 
      AND nm.status = 'active'
    )
  );

-- Group owners and moderators can update their groups
CREATE POLICY "Group owners and moderators can update groups" ON public.groups
  FOR UPDATE
  USING (
    id IN (
      SELECT gm.group_id 
      FROM public.group_members gm 
      WHERE gm.user_id = auth.uid() 
      AND gm.role IN ('owner', 'moderator')
    )
  );

-- Group owners can delete their groups
CREATE POLICY "Group owners can delete groups" ON public.groups
  FOR DELETE
  USING (
    id IN (
      SELECT gm.group_id 
      FROM public.group_members gm 
      WHERE gm.user_id = auth.uid() 
      AND gm.role = 'owner'
    )
  );

-- RLS Policies for group_members table

-- Users can view members of groups they belong to
CREATE POLICY "Users can view group members" ON public.group_members
  FOR SELECT
  USING (
    group_id IN (
      SELECT gm.group_id 
      FROM public.group_members gm 
      WHERE gm.user_id = auth.uid()
    )
  );

-- Users can join groups (insert their own membership)
CREATE POLICY "Users can join groups" ON public.group_members
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can leave groups (delete their own membership)
CREATE POLICY "Users can leave groups" ON public.group_members
  FOR DELETE
  USING (auth.uid() = user_id);

-- Group owners and moderators can manage memberships
CREATE POLICY "Group owners and moderators can manage memberships" ON public.group_members
  FOR ALL
  USING (
    group_id IN (
      SELECT gm.group_id 
      FROM public.group_members gm 
      WHERE gm.user_id = auth.uid() 
      AND gm.role IN ('owner', 'moderator')
    )
  );

-- Update neighborhood physical units for groups feature
ALTER TABLE public.neighborhoods 
ADD COLUMN IF NOT EXISTS physical_unit_type text DEFAULT 'street',
ADD COLUMN IF NOT EXISTS physical_unit_label text DEFAULT 'Street',
ADD COLUMN IF NOT EXISTS physical_units jsonb DEFAULT '[]'::jsonb;