-- Create RLS policies for group_members table
-- This allows group members to view all members of their groups

-- Policy to allow viewing group members if user is authenticated
CREATE POLICY "Allow viewing group members for authenticated users" ON public.group_members
FOR SELECT 
TO authenticated
USING (true);

-- Policy to allow inserting group members (for joining groups)
CREATE POLICY "Allow inserting group members" ON public.group_members
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy to allow updating group members (for role changes by group managers)
CREATE POLICY "Allow updating group members by group managers" ON public.group_members
FOR UPDATE 
TO authenticated
USING (
  -- Either the user is updating their own record
  user_id = auth.uid() 
  OR 
  -- Or the user is a group manager (owner/moderator) in this group
  public.is_group_manager(auth.uid(), group_id)
);

-- Policy to allow deleting group members (for leaving groups or being removed)
CREATE POLICY "Allow deleting group members" ON public.group_members
FOR DELETE 
TO authenticated
USING (
  -- Either the user is leaving themselves
  user_id = auth.uid() 
  OR 
  -- Or the user is a group manager (owner/moderator) in this group
  public.is_group_manager(auth.uid(), group_id)
);