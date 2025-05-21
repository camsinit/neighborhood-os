
-- Migration to move neighborhood notification logic from edge functions to database triggers
-- This helps standardize our notification approach and improves reliability

-- First, let's create or replace the profile update notification trigger
CREATE OR REPLACE FUNCTION public.create_profile_update_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_display_name TEXT;
  user_neighborhood_id UUID;
  log_id TEXT;
  significant_change BOOLEAN := FALSE;
  changed_fields TEXT[] := '{}';
BEGIN
  -- Generate a transaction ID for logging
  log_id := 'PROFILE_UPDATE_' || substr(md5(random()::text), 1, 8);
  
  -- Log the start of function execution
  RAISE LOG '[create_profile_update_notification] [%] Starting execution for user: %', 
    log_id, NEW.id;

  -- Check if significant fields were updated (only create notifications for meaningful changes)
  IF OLD.display_name IS DISTINCT FROM NEW.display_name THEN
    significant_change := TRUE;
    changed_fields := array_append(changed_fields, 'display_name');
  END IF;
  
  IF OLD.avatar_url IS DISTINCT FROM NEW.avatar_url THEN
    significant_change := TRUE;
    changed_fields := array_append(changed_fields, 'avatar_url');
  END IF;
  
  IF OLD.bio IS DISTINCT FROM NEW.bio THEN
    significant_change := TRUE;
    changed_fields := array_append(changed_fields, 'bio');
  END IF;
  
  IF OLD.skills IS DISTINCT FROM NEW.skills THEN
    significant_change := TRUE;
    changed_fields := array_append(changed_fields, 'skills');
  END IF;
  
  -- If no significant changes, exit early
  IF NOT significant_change THEN
    RETURN NEW;
  END IF;
  
  -- Get user's display name
  user_display_name := NEW.display_name;
  IF user_display_name IS NULL THEN
    user_display_name := 'A neighbor';
  END IF;
  
  -- Find user's neighborhood
  SELECT neighborhood_id INTO user_neighborhood_id
  FROM neighborhood_members
  WHERE user_id = NEW.id
  AND status = 'active'
  LIMIT 1;
  
  -- If no neighborhood found, check if they created one
  IF user_neighborhood_id IS NULL THEN
    SELECT id INTO user_neighborhood_id
    FROM neighborhoods
    WHERE created_by = NEW.id
    LIMIT 1;
  END IF;
  
  -- If we found a neighborhood, create an activity
  IF user_neighborhood_id IS NOT NULL THEN
    -- Create activity for the neighborhood feed
    INSERT INTO activities (
      actor_id,
      activity_type,
      content_id,
      content_type,
      title,
      neighborhood_id,
      metadata
    ) VALUES (
      NEW.id,
      'profile_updated',
      NEW.id,
      'neighbors',
      user_display_name || ' updated their profile',
      user_neighborhood_id,
      jsonb_build_object(
        'neighborName', user_display_name,
        'updatedFields', changed_fields,
        'action', 'update'
      )
    );
    
    -- For profile updates, we don't create direct notifications to all neighbors
    -- as it would be too spammy. We just create the activity so it shows in the feed.
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_profile_update_notification] [%] Error: %', log_id, SQLERRM;
    RETURN NEW; -- Return NEW even on error to prevent transaction failure
END;
$function$;

-- Make sure the trigger is attached to the profiles table
DROP TRIGGER IF EXISTS on_profile_update ON profiles;
CREATE TRIGGER on_profile_update
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_update_notification();

-- Now let's enhance the neighbor join notification trigger
CREATE OR REPLACE FUNCTION public.create_neighbor_join_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  neighborhood_name TEXT;
  user_display_name TEXT;
  log_id TEXT;
BEGIN
  -- Only trigger for new rows with 'active' status
  IF TG_OP != 'INSERT' OR NEW.status != 'active' THEN
    RETURN NEW;
  END IF;

  -- Generate a transaction ID for logging
  log_id := 'NEIGHBOR_JOIN_' || substr(md5(random()::text), 1, 8);
  
  -- Log the start of function execution
  RAISE LOG '[create_neighbor_join_notification] [%] Starting execution for new neighbor: %', 
    log_id, NEW.user_id;

  -- Get neighborhood name
  SELECT name INTO neighborhood_name
  FROM neighborhoods
  WHERE id = NEW.neighborhood_id;
  
  -- Get user display name
  SELECT display_name INTO user_display_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Default display name if none set
  IF user_display_name IS NULL THEN
    user_display_name := 'A new neighbor';
  END IF;
  
  -- Create activity for the neighborhood feed
  INSERT INTO activities (
    actor_id,
    activity_type,
    content_id,
    content_type,
    title,
    neighborhood_id,
    metadata
  ) VALUES (
    NEW.user_id,
    'neighbor_joined',
    NEW.user_id,
    'neighbors',
    user_display_name || ' joined the neighborhood',
    NEW.neighborhood_id,
    jsonb_build_object(
      'neighborName', user_display_name,
      'action', 'join'
    )
  );
    
  -- Notify existing members about the new neighbor (except themselves)
  -- Using the standard notification table directly
  INSERT INTO notifications (
    user_id,
    actor_id,
    title,
    content_type, 
    content_id,
    notification_type,
    action_type,
    action_label,
    relevance_score,
    metadata
  )
  SELECT
    nm.user_id, -- recipient
    NEW.user_id, -- actor (the new neighbor)
    user_display_name || ' joined your neighborhood', -- title
    'neighbors', -- content_type
    NEW.user_id, -- content_id (user ID of new neighbor)
    'neighbor_welcome', -- notification_type 
    'view', -- action_type
    'View Profile', -- action_label
    2, -- relevance_score (medium)
    jsonb_build_object(
      'neighborName', user_display_name,
      'action', 'join'
    ) -- metadata
  FROM 
    neighborhood_members nm
  WHERE 
    nm.neighborhood_id = NEW.neighborhood_id
    AND nm.status = 'active'
    AND nm.user_id != NEW.user_id; -- Don't notify the person who just joined
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_neighbor_join_notification] [%] Error: %', log_id, SQLERRM;
    RETURN NEW; -- Return NEW even on error to prevent transaction failure
END;
$function$;

-- Make sure the trigger is attached to the neighborhood_members table
DROP TRIGGER IF EXISTS on_neighbor_join ON neighborhood_members;
CREATE TRIGGER on_neighbor_join
  AFTER INSERT ON neighborhood_members
  FOR EACH ROW
  EXECUTE FUNCTION create_neighbor_join_notification();

-- Comment on the functions
COMMENT ON FUNCTION public.create_profile_update_notification() IS 
  'Creates activities when a profile is significantly updated';
  
COMMENT ON FUNCTION public.create_neighbor_join_notification() IS 
  'Creates notifications and activities when someone joins a neighborhood';

-- Add helpful index to improve notification querying performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id, is_read, is_archived);
