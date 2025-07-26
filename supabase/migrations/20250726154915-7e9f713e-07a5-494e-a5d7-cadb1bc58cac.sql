-- Update the prevent_multiple_neighborhoods function to allow super admins to bypass the restriction
CREATE OR REPLACE FUNCTION public.prevent_multiple_neighborhoods()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow super admins to bypass the neighborhood creation restriction
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.created_by 
    AND role = 'super_admin'::user_role
  ) THEN
    RETURN NEW; -- Allow super admins to create multiple neighborhoods
  END IF;
  
  -- Enforce the restriction for non-super-admin users
  IF EXISTS (
    SELECT 1 FROM neighborhood_members 
    WHERE user_id = NEW.created_by 
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'User is already a member of a neighborhood and cannot create another one';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;