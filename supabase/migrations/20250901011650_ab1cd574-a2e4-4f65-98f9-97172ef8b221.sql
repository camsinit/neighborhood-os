-- Ensure the trigger exists to automatically add group creator as owner
-- First check if trigger already exists and drop it if needed
DROP TRIGGER IF EXISTS trigger_add_group_creator_as_owner ON public.groups;

-- Create or replace the trigger function (in case it needs updating)
CREATE OR REPLACE FUNCTION public.add_group_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Add the creator as the group owner
  INSERT INTO public.group_members (group_id, user_id, role, joined_at)
  VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_at);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create the trigger to automatically add creator as owner when a group is created
CREATE TRIGGER trigger_add_group_creator_as_owner
  AFTER INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.add_group_creator_as_owner();