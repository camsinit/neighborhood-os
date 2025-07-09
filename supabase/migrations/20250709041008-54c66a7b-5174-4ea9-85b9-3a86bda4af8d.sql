-- Fix notification system to only send personally relevant notifications
-- Remove triggers that send notifications for general neighborhood activity

-- Drop all goods notification triggers first, then the function
DROP TRIGGER IF EXISTS goods_exchange_notification_trigger ON goods_exchange;
DROP TRIGGER IF EXISTS goods_notification_trigger ON goods_exchange;
DROP TRIGGER IF EXISTS create_goods_notification_trigger ON goods_exchange;
DROP FUNCTION IF EXISTS create_goods_notification();

-- Drop general neighbor join notification triggers (keep activity creation)
DROP TRIGGER IF EXISTS create_neighbor_join_notification_trigger ON neighborhood_members;
DROP FUNCTION IF EXISTS create_neighbor_join_notification();

-- Update safety notification function to only notify for emergencies and suspicious activity
-- This replaces the existing function to be more selective
CREATE OR REPLACE FUNCTION public.create_selective_safety_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  notification_title TEXT;
  actor_name TEXT;
  log_id TEXT;
BEGIN
  -- Generate a transaction ID for logging
  log_id := 'SAFETY_SELECTIVE_' || substr(md5(random()::text), 1, 8);
  
  -- Log the start of function execution
  RAISE LOG '[create_selective_safety_notification] [%] Starting execution for safety update: %', log_id, NEW.id;

  -- Only create notifications for Emergency and Suspicious Activity types
  -- Regular safety updates should only create activity feed entries
  IF NEW.type NOT IN ('Emergency', 'Suspicious Activity') THEN
    RAISE LOG '[create_selective_safety_notification] [%] Skipping notification for type: %', log_id, NEW.type;
    RETURN NEW;
  END IF;

  -- Get the actor's display name
  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
  FROM profiles p WHERE p.id = NEW.author_id;

  -- Use templated format based on safety type
  IF NEW.type = 'Emergency' THEN
    notification_title := actor_name || ' reported an emergency: ' || NEW.title;
  ELSE -- Suspicious Activity
    notification_title := actor_name || ' reported suspicious activity: ' || NEW.title;
  END IF;

  -- Only create notifications for new safety updates
  IF TG_OP = 'INSERT' THEN
    -- Notify all neighborhood members except the author for high-priority safety events
    PERFORM create_unified_system_notification(
      nm.user_id,                   -- recipient
      NEW.author_id,                -- actor
      notification_title,           -- title
      'safety',                     -- content_type
      NEW.id,                       -- content_id
      'safety'::notification_type,  -- notification_type
      'view'::notification_action_type, -- action_type
      'View Update',                -- action_label
      3,                            -- High importance for emergencies and suspicious activity
      jsonb_build_object(
        'templateId', 'safety_update',
        'variables', jsonb_build_object(
          'actor', actor_name,
          'title', NEW.title
        ),
        'safetyType', NEW.type
      )                             -- metadata
    )
    FROM neighborhood_members nm
    WHERE nm.neighborhood_id = NEW.neighborhood_id
      AND nm.status = 'active'
      AND nm.user_id != NEW.author_id;  -- Don't notify the author
    
    RAISE LOG '[create_selective_safety_notification] [%] High-priority safety notifications created successfully', log_id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_selective_safety_notification] [%] Error creating notification: %', log_id, SQLERRM;
    RETURN NEW; -- Return NEW even on error to prevent transaction failure
END;
$function$;

-- Replace the safety notification trigger with the selective one
DROP TRIGGER IF EXISTS create_templated_safety_notification_trigger ON safety_updates;
CREATE TRIGGER create_selective_safety_notification_trigger
AFTER INSERT ON safety_updates
FOR EACH ROW
EXECUTE FUNCTION public.create_selective_safety_notification();

-- Update skills notification to only notify skill providers when someone requests their specific skill
-- This replaces the broad skill notifications with targeted ones
DROP TRIGGER IF EXISTS create_simple_skill_notification_trigger ON skills_exchange;

CREATE OR REPLACE FUNCTION public.create_targeted_skill_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  skill_title TEXT;
  requester_name TEXT;
  log_id TEXT;
BEGIN
  -- Generate a log ID for tracing
  log_id := 'SKILL_TARGETED_' || substr(md5(random()::text), 1, 8);
  
  -- Only create notifications for skill requests (not offers)
  IF NEW.request_type != 'need' THEN
    RETURN NEW;
  END IF;
  
  -- Log the start of function execution
  RAISE LOG '[create_targeted_skill_notification] [%] Processing new skill request: %', 
    log_id, NEW.id;
    
  -- Get skill title and requester info
  skill_title := NEW.title;
  
  -- Get requester profile info
  SELECT display_name INTO requester_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Set default requester name if none found
  IF requester_name IS NULL THEN
    requester_name := 'A neighbor';
  END IF;
  
  -- Only notify neighbors who have offered the EXACT same skill category
  -- This is more targeted than the previous broad approach
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
    se_offers.user_id,
    NEW.user_id,
    requester_name || ' is looking for help with: ' || skill_title,
    'skills',
    NEW.id,
    'skills',
    'contact',
    'Share Contact Info',
    3, -- High relevance: direct match
    jsonb_build_object(
      'skillId', NEW.id,
      'requesterId', NEW.user_id,
      'skillTitle', skill_title,
      'neighborName', requester_name,
      'contextType', 'skill_request_match',
      'actionRequired', true
    )
  FROM skills_exchange se_offers
  WHERE se_offers.skill_category = NEW.skill_category
    AND se_offers.request_type = 'offer'
    AND se_offers.neighborhood_id = NEW.neighborhood_id
    AND se_offers.user_id != NEW.user_id  -- Don't notify the requester
    AND se_offers.is_archived = false; -- Only notify for active skills
  
  RAISE LOG '[create_targeted_skill_notification] [%] Targeted skill notifications created', log_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_targeted_skill_notification] [%] Error creating notification: %', log_id, SQLERRM;
    RETURN NEW; -- Return NEW even on error to prevent transaction failure
END;
$function$;

-- Add the targeted skills notification trigger
CREATE TRIGGER create_targeted_skill_notification_trigger
AFTER INSERT ON skills_exchange
FOR EACH ROW
EXECUTE FUNCTION public.create_targeted_skill_notification();