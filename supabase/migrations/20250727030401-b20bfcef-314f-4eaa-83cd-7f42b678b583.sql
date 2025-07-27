-- Create function to accept admin invitation
CREATE OR REPLACE FUNCTION public.accept_admin_invitation(invitation_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invitation_record invitations%ROWTYPE;
  accepting_user_id uuid;
  result jsonb;
BEGIN
  accepting_user_id := auth.uid();
  
  -- Get invitation details
  SELECT * INTO invitation_record
  FROM invitations 
  WHERE invite_code = invitation_code 
  AND status = 'pending'
  AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or expired invitation code'
    );
  END IF;
  
  -- Add user as neighborhood member
  INSERT INTO neighborhood_members (user_id, neighborhood_id, status)
  VALUES (accepting_user_id, invitation_record.neighborhood_id, 'active')
  ON CONFLICT (user_id, neighborhood_id) DO UPDATE 
  SET status = 'active';
  
  -- Assign admin role
  INSERT INTO neighborhood_roles (user_id, neighborhood_id, role, assigned_by)
  VALUES (accepting_user_id, invitation_record.neighborhood_id, 'admin', invitation_record.inviter_id)
  ON CONFLICT (user_id, neighborhood_id) DO UPDATE 
  SET role = 'admin', assigned_by = invitation_record.inviter_id;
  
  -- Mark invitation as accepted
  UPDATE invitations 
  SET status = 'accepted', 
      accepted_by_id = accepting_user_id, 
      accepted_at = now()
  WHERE id = invitation_record.id;
  
  RETURN jsonb_build_object(
    'success', true,
    'neighborhood_id', invitation_record.neighborhood_id,
    'neighborhood_name', (SELECT name FROM neighborhoods WHERE id = invitation_record.neighborhood_id),
    'role', 'admin'
  );
END;
$function$