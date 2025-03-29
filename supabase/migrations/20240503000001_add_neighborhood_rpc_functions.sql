
-- Add safe RPC functions to avoid infinite recursion in policies

-- Function to get neighborhoods created by a user
CREATE OR REPLACE FUNCTION public.get_user_created_neighborhoods(user_uuid UUID)
RETURNS SETOF neighborhoods
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM neighborhoods
  WHERE created_by = user_uuid
  ORDER BY created_at DESC;
$$;

-- Function to get all neighborhoods safely
CREATE OR REPLACE FUNCTION public.get_all_neighborhoods_safe()
RETURNS SETOF neighborhoods
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM neighborhoods
  ORDER BY name ASC;
$$;

-- Function to safely get a user's neighborhood memberships
CREATE OR REPLACE FUNCTION public.get_user_neighborhood_memberships(user_uuid UUID)
RETURNS TABLE (
  neighborhood_id UUID,
  user_id UUID,
  status TEXT,
  joined_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT neighborhood_id, user_id, status, joined_at
  FROM neighborhood_members
  WHERE user_id = user_uuid
  AND status = 'active';
$$;
