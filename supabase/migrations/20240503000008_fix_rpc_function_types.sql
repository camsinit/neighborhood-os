
-- Create a function to get publicly visible profiles
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

-- Function for getting neighborhoods created by user
CREATE OR REPLACE FUNCTION public.get_user_created_neighborhoods(user_uuid UUID)
RETURNS TABLE(id UUID, name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT n.id, n.name
  FROM neighborhoods n
  WHERE n.created_by = user_uuid;
END;
$$;
