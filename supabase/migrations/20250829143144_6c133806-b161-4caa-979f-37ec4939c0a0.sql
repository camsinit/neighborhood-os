-- Remove creator privileges from neighborhood access policies
-- Only allow access based on actual membership, not creation

-- Update events policies to remove creator access
DROP POLICY IF EXISTS "Users can view events in their neighborhoods" ON events;
CREATE POLICY "Users can view events in their neighborhoods" 
ON events FOR SELECT 
USING (
  auth.uid() IN (
    SELECT nm.user_id 
    FROM neighborhood_members nm 
    WHERE nm.neighborhood_id = events.neighborhood_id 
    AND nm.status = 'active'
  )
);

DROP POLICY IF EXISTS "Users can create events in their neighborhoods" ON events;
CREATE POLICY "Users can create events in their neighborhoods" 
ON events FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT nm.user_id 
    FROM neighborhood_members nm 
    WHERE nm.neighborhood_id = events.neighborhood_id 
    AND nm.status = 'active'
  )
);

-- Update safety_updates policies
DROP POLICY IF EXISTS "Users can view safety updates in their neighborhoods" ON safety_updates;
CREATE POLICY "Users can view safety updates in their neighborhoods" 
ON safety_updates FOR SELECT 
USING (
  auth.uid() IN (
    SELECT nm.user_id 
    FROM neighborhood_members nm 
    WHERE nm.neighborhood_id = safety_updates.neighborhood_id 
    AND nm.status = 'active'
  )
);

DROP POLICY IF EXISTS "Users can create safety updates in their neighborhoods" ON safety_updates;
CREATE POLICY "Users can create safety updates in their neighborhoods" 
ON safety_updates FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT nm.user_id 
    FROM neighborhood_members nm 
    WHERE nm.neighborhood_id = safety_updates.neighborhood_id 
    AND nm.status = 'active'
  )
);

-- Update goods_exchange policies
DROP POLICY IF EXISTS "Users can view goods from their neighborhoods" ON goods_exchange;
CREATE POLICY "Users can view goods from their neighborhoods" 
ON goods_exchange FOR SELECT 
USING (
  auth.uid() IN (
    SELECT nm.user_id 
    FROM neighborhood_members nm 
    WHERE nm.neighborhood_id = goods_exchange.neighborhood_id 
    AND nm.status = 'active'
  )
);

DROP POLICY IF EXISTS "Users can create goods in their neighborhoods" ON goods_exchange;
CREATE POLICY "Users can create goods in their neighborhoods" 
ON goods_exchange FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  auth.uid() IN (
    SELECT nm.user_id 
    FROM neighborhood_members nm 
    WHERE nm.neighborhood_id = goods_exchange.neighborhood_id 
    AND nm.status = 'active'
  )
);

-- Update skills_exchange policies  
DROP POLICY IF EXISTS "Neighborhood skills visibility" ON skills_exchange;
CREATE POLICY "Neighborhood skills visibility" 
ON skills_exchange FOR SELECT 
USING (
  auth.uid() IN (
    SELECT nm.user_id 
    FROM neighborhood_members nm 
    WHERE nm.neighborhood_id = skills_exchange.neighborhood_id 
    AND nm.status = 'active'
  )
);

-- Update activities policies
DROP POLICY IF EXISTS "Activity visibility" ON activities;
CREATE POLICY "Activity visibility" 
ON activities FOR SELECT 
USING (
  neighborhood_id IS NULL OR 
  auth.uid() IN (
    SELECT nm.user_id 
    FROM neighborhood_members nm 
    WHERE nm.neighborhood_id = activities.neighborhood_id 
    AND nm.status = 'active'
  )
);

-- Update neighborhood_members policies to remove creator access
DROP POLICY IF EXISTS "Neighborhood creators can view members" ON neighborhood_members;
DROP POLICY IF EXISTS "Neighborhood creators can manage members" ON neighborhood_members;

-- Update is_user_in_neighborhood function to only check membership
CREATE OR REPLACE FUNCTION public.is_user_in_neighborhood(user_uuid uuid, neighborhood_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Super admins have access to all neighborhoods
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid 
    AND role = 'super_admin'::user_role
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Only check membership, not creation
  RETURN EXISTS (
    SELECT 1 FROM neighborhood_members
    WHERE user_id = user_uuid 
    AND neighborhood_id = neighborhood_uuid 
    AND status = 'active'
  );
END;
$function$;