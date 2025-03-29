
-- Create a suite of security definer functions to avoid RLS recursion issues

-- Create a security definer function to check if a user is a core contributor with access
CREATE OR REPLACE FUNCTION public.user_is_core_contributor_with_access(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM core_contributors
    WHERE user_id = user_uuid
    AND can_access_all_neighborhoods = true
  );
END;
$$;

-- Create a security definer function to get a user's neighborhood memberships
CREATE OR REPLACE FUNCTION public.get_user_neighborhood_memberships(user_uuid UUID)
RETURNS TABLE (
  neighborhood_id UUID,
  user_id UUID,
  status TEXT,
  joined_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nm.neighborhood_id,
    nm.user_id,
    nm.status,
    nm.joined_at
  FROM 
    neighborhood_members nm
  WHERE 
    nm.user_id = user_uuid
    AND nm.status = 'active';
END;
$$;

-- Create a safer version of the neighborhood members function
CREATE OR REPLACE FUNCTION public.get_neighborhood_members_safe(neighborhood_uuid UUID)
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT user_id 
  FROM neighborhood_members
  WHERE neighborhood_id = neighborhood_uuid
  AND status = 'active';
END;
$$;

-- Create a function to get all neighborhoods safely
CREATE OR REPLACE FUNCTION public.get_all_neighborhoods_safe()
RETURNS SETOF neighborhoods
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM neighborhoods
  ORDER BY name ASC;
END;
$$;
