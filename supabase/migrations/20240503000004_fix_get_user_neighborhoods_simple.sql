
-- First drop the existing function if it exists
DROP FUNCTION IF EXISTS public.get_user_neighborhoods_simple(UUID);

-- Then recreate it with the correct return type
CREATE OR REPLACE FUNCTION public.get_user_neighborhoods_simple(user_uuid UUID)
RETURNS TABLE(id UUID, name TEXT, joined_at TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- First return neighborhoods the user created
  RETURN QUERY
  SELECT 
    n.id, 
    n.name, 
    n.created_at as joined_at
  FROM 
    neighborhoods n
  WHERE 
    n.created_by = user_uuid;
    
  -- If none found, return neighborhoods where the user is a member
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      n.id, 
      n.name, 
      nm.joined_at
    FROM 
      neighborhoods n
    JOIN 
      neighborhood_members nm ON n.id = nm.neighborhood_id
    WHERE 
      nm.user_id = user_uuid
      AND nm.status = 'active';
  END IF;
END;
$$;
