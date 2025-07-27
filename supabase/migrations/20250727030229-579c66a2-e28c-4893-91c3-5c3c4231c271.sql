-- Create function for admin invitation creation
CREATE OR REPLACE FUNCTION public.create_admin_invitation(
  target_email text,
  target_neighborhood_id uuid,
  invitation_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_invitation_id uuid;
  admin_user_id uuid;
  generated_code text;
BEGIN
  -- Get the current user ID
  admin_user_id := auth.uid();
  
  -- Verify the user is a super admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = admin_user_id 
    AND role = 'super_admin'::user_role
  ) THEN
    RAISE EXCEPTION 'Only super admins can create admin invitations';
  END IF;
  
  -- Verify the neighborhood exists
  IF NOT EXISTS (
    SELECT 1 FROM neighborhoods 
    WHERE id = target_neighborhood_id
  ) THEN
    RAISE EXCEPTION 'Neighborhood does not exist';
  END IF;
  
  -- Generate unique invite code
  generated_code := substr(md5(random()::text || target_email || target_neighborhood_id::text), 1, 12);
  
  -- Ensure invite code is unique
  WHILE EXISTS (SELECT 1 FROM invitations WHERE invite_code = generated_code) LOOP
    generated_code := substr(md5(random()::text || target_email || target_neighborhood_id::text), 1, 12);
  END LOOP;
  
  -- Create the admin invitation
  INSERT INTO invitations (
    neighborhood_id,
    inviter_id,
    email,
    invite_code,
    status
  ) VALUES (
    target_neighborhood_id,
    admin_user_id,
    target_email,
    generated_code,
    'pending'
  ) RETURNING id INTO new_invitation_id;
  
  -- Insert into email queue for admin invitation
  INSERT INTO email_queue (
    recipient_email,
    template_type,
    template_data,
    neighborhood_id,
    user_id
  ) VALUES (
    target_email,
    'admin_invitation',
    jsonb_build_object(
      'invite_code', generated_code,
      'neighborhood_name', (SELECT name FROM neighborhoods WHERE id = target_neighborhood_id),
      'inviter_name', (SELECT COALESCE(display_name, 'A neighbor') FROM profiles WHERE id = admin_user_id),
      'invitation_message', COALESCE(invitation_message, 'You have been invited to become the admin of this neighborhood!'),
      'invitation_id', new_invitation_id
    ),
    target_neighborhood_id,
    admin_user_id
  );
  
  RETURN new_invitation_id;
END;
$function$