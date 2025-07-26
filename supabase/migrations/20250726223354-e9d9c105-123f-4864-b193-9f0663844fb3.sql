-- Fix security issue: Add search_path to prevent_multiple_memberships function
CREATE OR REPLACE FUNCTION public.prevent_multiple_memberships()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip checks for super admins as they use invisible access, not membership
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.user_id 
    AND role = 'super_admin'::user_role
  ) THEN
    RETURN NEW;
  END IF;
  
  -- Regular users cannot join if they already created a neighborhood
  IF EXISTS (SELECT 1 FROM neighborhoods WHERE created_by = NEW.user_id) THEN
    RAISE EXCEPTION 'User has already created a neighborhood and cannot join another one';
  END IF;
  
  -- Regular users cannot join multiple neighborhoods as members
  IF EXISTS (SELECT 1 FROM neighborhood_members WHERE user_id = NEW.user_id AND status = 'active') THEN
    RAISE EXCEPTION 'User is already a member of a neighborhood and cannot join another one';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';