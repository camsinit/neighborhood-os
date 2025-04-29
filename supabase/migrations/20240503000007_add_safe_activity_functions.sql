
-- Add safe function to get activities without triggering recursion issues
CREATE OR REPLACE FUNCTION public.get_activities_safe(user_uuid UUID, limit_count INTEGER DEFAULT 20)
RETURNS TABLE(id UUID, actor_id UUID, activity_type TEXT, content_id UUID, content_type TEXT, title TEXT, created_at TIMESTAMP WITH TIME ZONE, metadata JSONB, neighborhood_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Get neighborhoods the user has access to without recursion
  RETURN QUERY
  WITH user_neighborhoods AS (
    -- Get neighborhoods created by user 
    SELECT id FROM neighborhoods WHERE created_by = user_uuid
    
    UNION
    
    -- Get neighborhoods where user is a member
    SELECT neighborhood_id FROM neighborhood_members 
    WHERE user_id = user_uuid AND status = 'active'
  )
  SELECT 
    a.id,
    a.actor_id,
    a.activity_type::TEXT,
    a.content_id,
    a.content_type,
    a.title,
    a.created_at,
    a.metadata,
    a.neighborhood_id
  FROM 
    activities a
  WHERE 
    (a.neighborhood_id IS NULL)  -- Public activities
    OR 
    (a.neighborhood_id IN (SELECT id FROM user_neighborhoods))  -- Activities in user's neighborhoods
  ORDER BY 
    a.created_at DESC
  LIMIT 
    limit_count;
END;
$$;

-- Function to get publicly visible profiles
CREATE OR REPLACE FUNCTION public.get_publicly_visible_profiles(limit_num INTEGER DEFAULT 20)
RETURNS TABLE(id UUID, display_name TEXT, avatar_url TEXT, address TEXT, phone_number TEXT, access_needs TEXT, email_visible BOOLEAN, phone_visible BOOLEAN, address_visible BOOLEAN, needs_visible BOOLEAN, bio TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, 
    p.display_name, 
    p.avatar_url, 
    p.address,
    p.phone_number,
    p.access_needs,
    p.email_visible,
    p.phone_visible,
    p.address_visible,
    p.needs_visible,
    p.bio
  FROM 
    profiles p
  LIMIT limit_num;
END;
$$;

-- Function to get user emails safely
CREATE OR REPLACE FUNCTION public.get_visible_user_emails(user_ids UUID[])
RETURNS TABLE(id UUID, email TEXT, created_at TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.created_at
  FROM 
    auth.users u
  WHERE 
    u.id = ANY(user_ids);
END;
$$;

-- Function to get neighborhood members with profile info
CREATE OR REPLACE FUNCTION public.get_neighborhood_members_with_profiles(neighborhood_uuid UUID)
RETURNS TABLE(
  user_id UUID, 
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  address TEXT,
  phone_number TEXT,
  access_needs TEXT,
  email_visible BOOLEAN,
  phone_visible BOOLEAN,
  address_visible BOOLEAN,
  needs_visible BOOLEAN,
  bio TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nm.user_id,
    p.display_name,
    u.email,
    p.avatar_url,
    p.address,
    p.phone_number,
    p.access_needs,
    p.email_visible,
    p.phone_visible,
    p.address_visible,
    p.needs_visible,
    p.bio
  FROM 
    neighborhood_members nm
  JOIN 
    profiles p ON nm.user_id = p.id
  JOIN 
    auth.users u ON nm.user_id = u.id
  WHERE 
    nm.neighborhood_id = neighborhood_uuid
    AND nm.status = 'active';
END;
$$;
