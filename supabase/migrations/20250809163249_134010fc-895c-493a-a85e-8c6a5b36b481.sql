-- 1) Add is_admin_invite column to invitations for admin-specific invites
ALTER TABLE public.invitations
ADD COLUMN IF NOT EXISTS is_admin_invite boolean NOT NULL DEFAULT false;

-- 2) Create a unique invite code generator for invitations (similar to generate_share_code)
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  -- Generate a 12-character random code
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;

  -- Ensure uniqueness within invitations.invite_code
  WHILE EXISTS (SELECT 1 FROM invitations WHERE invite_code = result) LOOP
    result := '';
    FOR i IN 1..12 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
  END LOOP;

  RETURN result;
END;
$$;

-- 3) Create a helper function to check neighborhood admin rights
--    This keeps our SECURITY DEFINER RPC clean and avoids complex SQL in the main function
CREATE OR REPLACE FUNCTION public.user_is_neighborhood_admin(_user uuid, _neighborhood uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT (
    -- Neighborhood creator is implicitly admin
    EXISTS (
      SELECT 1 FROM neighborhoods n
      WHERE n.id = _neighborhood AND n.created_by = _user
    )
    OR
    -- Explicit admin role in neighborhood_roles
    EXISTS (
      SELECT 1 FROM neighborhood_roles nr
      WHERE nr.neighborhood_id = _neighborhood AND nr.user_id = _user AND nr.role = 'admin'
    )
    OR
    -- Global super admin
    public.is_super_admin(_user)
  );
$$;

-- 4) Create or replace RPC to create an admin invitation. This will:
--    - validate caller permissions (admin/creator/super_admin)
--    - generate a single-use invite code (no expiration)
--    - mark the invite as admin (is_admin_invite = true)
--    - return the invitation id so the frontend can fetch the code and send email
CREATE OR REPLACE FUNCTION public.create_admin_invitation(
  target_email text,
  target_neighborhood_id uuid,
  invitation_message text DEFAULT NULL  -- kept for interface compatibility; not stored currently
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_invite_id uuid;
  inviter uuid;
  code text;
BEGIN
  -- Get the caller
  inviter := auth.uid();
  IF inviter IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create invitations';
  END IF;

  -- Enforce that only neighborhood admins/creators or super admins can create admin invites
  IF NOT public.user_is_neighborhood_admin(inviter, target_neighborhood_id) THEN
    RAISE EXCEPTION 'Only admins can create admin invitations for this neighborhood';
  END IF;

  -- Generate a unique invite code
  code := public.generate_invite_code();

  -- Insert invitation as single-use (status starts pending); not email-locked (email optional)
  INSERT INTO public.invitations (
    email,
    inviter_id,
    neighborhood_id,
    invite_code,
    status,
    is_admin_invite
  ) VALUES (
    target_email,
    inviter,
    target_neighborhood_id,
    code,
    'pending',
    true
  ) RETURNING id INTO new_invite_id;

  RETURN new_invite_id;
END;
$$;

-- 5) Trigger to auto-assign admin role on acceptance of an admin invite
--    Single-use is already enforced via RLS (can only update from pending->accepted once),
--    but this ensures the proper role is granted to whoever accepts (any email account).
CREATE OR REPLACE FUNCTION public.assign_admin_role_on_invite_accept()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only act when invitation transitions to accepted
  IF TG_OP = 'UPDATE'
     AND NEW.status = 'accepted'
     AND COALESCE(OLD.status, '') <> 'accepted'
     AND NEW.is_admin_invite = true
     AND NEW.accepted_by_id IS NOT NULL THEN

    -- Insert admin role if it doesn't already exist
    IF NOT EXISTS (
      SELECT 1 FROM public.neighborhood_roles nr
      WHERE nr.user_id = NEW.accepted_by_id
        AND nr.neighborhood_id = NEW.neighborhood_id
        AND nr.role = 'admin'
    ) THEN
      INSERT INTO public.neighborhood_roles (user_id, neighborhood_id, role, assigned_by)
      VALUES (NEW.accepted_by_id, NEW.neighborhood_id, 'admin', NEW.inviter_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_admin_on_invite_accept ON public.invitations;
CREATE TRIGGER trg_assign_admin_on_invite_accept
AFTER UPDATE ON public.invitations
FOR EACH ROW
EXECUTE FUNCTION public.assign_admin_role_on_invite_accept();