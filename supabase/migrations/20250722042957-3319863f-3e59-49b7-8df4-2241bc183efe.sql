-- Add header image field to neighborhoods table for invite customization
ALTER TABLE public.neighborhoods 
ADD COLUMN invite_header_image_url TEXT;

-- Drop and recreate the get_neighborhood_from_invite function to include inviter profile information
DROP FUNCTION public.get_neighborhood_from_invite(text);

CREATE OR REPLACE FUNCTION public.get_neighborhood_from_invite(invite_code_param text)
RETURNS TABLE(
  neighborhood_id uuid, 
  neighborhood_name text, 
  neighborhood_city text, 
  neighborhood_state text, 
  neighborhood_created_at timestamp with time zone, 
  member_count bigint, 
  invitation_status text,
  inviter_id uuid,
  inviter_display_name text,
  inviter_avatar_url text,
  invite_header_image_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id as neighborhood_id, 
    n.name as neighborhood_name, 
    n.city as neighborhood_city, 
    n.state as neighborhood_state,
    n.created_at as neighborhood_created_at, 
    COALESCE(member_counts.count, 0) as member_count, 
    i.status as invitation_status,
    i.inviter_id,
    COALESCE(p.display_name, 'A neighbor') as inviter_display_name,
    p.avatar_url as inviter_avatar_url,
    n.invite_header_image_url
  FROM invitations i
  JOIN neighborhoods n ON i.neighborhood_id = n.id
  LEFT JOIN profiles p ON i.inviter_id = p.id
  LEFT JOIN (
    SELECT nm.neighborhood_id, COUNT(*) as count 
    FROM neighborhood_members nm
    WHERE nm.status = 'active' 
    GROUP BY nm.neighborhood_id
  ) member_counts ON n.id = member_counts.neighborhood_id
  WHERE i.invite_code = invite_code_param;
END;
$$;