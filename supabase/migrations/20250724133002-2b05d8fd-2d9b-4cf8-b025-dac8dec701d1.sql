-- Create function to get all neighborhoods for super admins
CREATE OR REPLACE FUNCTION public.get_all_neighborhoods_for_super_admin()
RETURNS TABLE(
  id uuid,
  name text,
  created_by uuid,
  city text,
  state text,
  timezone text,
  invite_header_image_url text,
  zip text,
  address text,
  geo_boundary jsonb,
  created_at timestamp with time zone,
  member_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if the user has super admin role
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Super admin privileges required.';
  END IF;

  -- Return all neighborhoods with member counts
  RETURN QUERY
  SELECT 
    n.id,
    n.name,
    n.created_by,
    n.city,
    n.state,
    n.timezone,
    n.invite_header_image_url,
    n.zip,
    n.address,
    n.geo_boundary,
    n.created_at,
    COALESCE(member_counts.count, 0) + 1 as member_count  -- +1 for creator
  FROM neighborhoods n
  LEFT JOIN (
    SELECT nm.neighborhood_id, COUNT(*) as count 
    FROM neighborhood_members nm
    WHERE nm.status = 'active' 
    GROUP BY nm.neighborhood_id
  ) member_counts ON n.id = member_counts.neighborhood_id
  ORDER BY n.name ASC;
END;
$$;