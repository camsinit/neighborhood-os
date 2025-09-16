-- Add group_id field to events table to link events to groups
ALTER TABLE public.events 
ADD COLUMN group_id uuid REFERENCES public.groups(id) ON DELETE SET NULL;

-- Add index for better performance when querying group events
CREATE INDEX idx_events_group_id ON public.events(group_id);

-- Update existing RLS policies to ensure group members can view group events
-- (Events are already public, so no changes needed to SELECT policies)

-- Allow group members to create events for their groups
CREATE POLICY "Group members can create group events" 
ON public.events 
FOR INSERT 
WITH CHECK (
  group_id IS NULL OR (
    auth.uid() = host_id AND 
    is_group_member(auth.uid(), group_id)
  )
);

-- Allow group moderators/owners to update any group event, plus event creators
CREATE POLICY "Group managers and event creators can update group events" 
ON public.events 
FOR UPDATE 
USING (
  auth.uid() = host_id OR 
  (group_id IS NOT NULL AND is_group_manager(auth.uid(), group_id))
);

-- Allow group moderators/owners to delete any group event, plus event creators  
CREATE POLICY "Group managers and event creators can delete group events" 
ON public.events 
FOR DELETE 
USING (
  auth.uid() = host_id OR 
  (group_id IS NOT NULL AND is_group_manager(auth.uid(), group_id))
);