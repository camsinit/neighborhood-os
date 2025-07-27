-- Create function for super admin neighborhood creation with membership control
CREATE OR REPLACE FUNCTION public.create_neighborhood_as_super_admin_with_options(
  neighborhood_name text,
  neighborhood_city text DEFAULT NULL::text,
  neighborhood_state text DEFAULT NULL::text,
  neighborhood_address text DEFAULT NULL::text,
  neighborhood_timezone text DEFAULT 'America/Los_Angeles'::text,
  join_as_member boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_neighborhood_id uuid;
  admin_user_id uuid;
BEGIN
  -- Get the current user ID
  admin_user_id := auth.uid();
  
  -- Verify the user is a super admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = admin_user_id 
    AND role = 'super_admin'::user_role
  ) THEN
    RAISE EXCEPTION 'Only super admins can use this function';
  END IF;
  
  -- Create the neighborhood
  INSERT INTO neighborhoods (
    name,
    city,
    state,
    address,
    timezone,
    created_by
  ) VALUES (
    neighborhood_name,
    neighborhood_city,
    neighborhood_state,
    neighborhood_address,
    neighborhood_timezone,
    admin_user_id
  ) RETURNING id INTO new_neighborhood_id;
  
  -- Only add super admin as member if join_as_member is true
  IF join_as_member THEN
    INSERT INTO neighborhood_members (user_id, neighborhood_id, status)
    VALUES (admin_user_id, new_neighborhood_id, 'active');
  END IF;
  
  RETURN new_neighborhood_id;
END;
$function$

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