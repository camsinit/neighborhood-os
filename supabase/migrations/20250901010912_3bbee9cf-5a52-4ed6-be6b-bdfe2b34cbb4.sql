-- Create helper functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.is_group_member(user_uuid uuid, group_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members
    WHERE user_id = user_uuid AND group_id = group_uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_manager(user_uuid uuid, group_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members
    WHERE user_id = user_uuid 
    AND group_id = group_uuid 
    AND role IN ('owner', 'moderator')
  );
$$;

-- Update the trigger function to use SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.add_group_creator_as_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Add the creator as the group owner
  INSERT INTO public.group_members (group_id, user_id, role, joined_at)
  VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_at);
  
  RETURN NEW;
END;
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Group owners and moderators can manage memberships" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;

-- Create new policies using helper functions
CREATE POLICY "Group owners and moderators can manage memberships"
ON public.group_members
FOR ALL
USING (public.is_group_manager(auth.uid(), group_id));

CREATE POLICY "Users can join groups"
ON public.group_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
ON public.group_members
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view group members"
ON public.group_members
FOR SELECT
USING (public.is_group_member(auth.uid(), group_id));