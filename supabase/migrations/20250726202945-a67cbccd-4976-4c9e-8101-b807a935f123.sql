-- Fix the prevent_multiple_memberships function to allow super admins 
-- unrestricted access and creators to join their own neighborhoods
CREATE OR REPLACE FUNCTION public.prevent_multiple_memberships()
RETURNS TRIGGER AS $$
BEGIN
  -- Super admins can join any neighborhood without restrictions
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.user_id 
    AND role = 'super_admin'::user_role
  ) THEN
    RETURN NEW;
  END IF;
  
  -- Allow users to join the neighborhood they created
  IF EXISTS (
    SELECT 1 FROM neighborhoods 
    WHERE created_by = NEW.user_id 
    AND id = NEW.neighborhood_id
  ) THEN
    RETURN NEW;
  END IF;
  
  -- Only prevent joining a DIFFERENT neighborhood if they created one
  IF EXISTS (
    SELECT 1 FROM neighborhoods 
    WHERE created_by = NEW.user_id 
    AND id != NEW.neighborhood_id
  ) THEN
    RAISE EXCEPTION 'User has already created a neighborhood and cannot join another one';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;