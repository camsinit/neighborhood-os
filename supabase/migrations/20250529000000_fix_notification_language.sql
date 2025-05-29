
-- This migration fixes notification language to be more natural and conversational
-- Particularly fixes RSVP notifications to use proper language

-- Drop the existing problematic trigger
DROP TRIGGER IF EXISTS create_rsvp_notification_trigger ON event_rsvps;
DROP FUNCTION IF EXISTS public.create_rsvp_notification();

-- Create an improved RSVP notification function with better language
CREATE OR REPLACE FUNCTION public.create_rsvp_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  notification_title TEXT;
  target_user_id UUID;
  event_title TEXT;
  log_id TEXT;
  existing_notification_count INTEGER;
BEGIN
  -- Generate a transaction ID for logging
  log_id := 'RSVP_NOTIFY_' || substr(md5(random()::text), 1, 8);
  
  -- Log the start of function execution
  RAISE LOG '[create_rsvp_notification] [%] Starting execution for RSVP id %', log_id, NEW.id;

  -- Get event title and host_id
  SELECT e.title, e.host_id INTO event_title, target_user_id
  FROM events e WHERE e.id = NEW.event_id;
  
  -- Only continue if we found the event and the host is different from the RSVP user
  IF target_user_id IS NULL THEN
    RAISE LOG '[create_rsvp_notification] [%] No event found for RSVP, skipping notification', log_id;
    RETURN NEW;
  END IF;
  
  -- Skip if user is RSVPing to their own event
  IF NEW.user_id = target_user_id THEN
    RAISE LOG '[create_rsvp_notification] [%] User RSVPing to own event, skipping notification', log_id;
    RETURN NEW;
  END IF;

  -- Check for existing notifications to prevent duplicates
  SELECT COUNT(*) INTO existing_notification_count
  FROM notifications
  WHERE 
    user_id = target_user_id AND 
    actor_id = NEW.user_id AND 
    content_type = 'events' AND
    content_id = NEW.event_id AND
    notification_type = 'event' AND
    action_type = 'rsvp' AND
    created_at > (NOW() - INTERVAL '30 minutes');
    
  -- Skip if we already have a recent notification for this RSVP
  IF existing_notification_count > 0 THEN
    RAISE LOG '[create_rsvp_notification] [%] Duplicate notification detected, skipping', log_id;
    RETURN NEW;
  END IF;

  -- Set notification title - FIXED: Use proper RSVP language
  notification_title := 'RSVP''d to ' || event_title;

  -- Log what we're about to insert
  RAISE LOG '[create_rsvp_notification] [%] Creating notification: title=%, recipient=%, actor=%', 
    log_id, notification_title, target_user_id, NEW.user_id;

  -- Create notification for the event host
  BEGIN
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
    ) VALUES (
      target_user_id,
      NEW.user_id,
      notification_title,
      'events',
      NEW.event_id,
      'event',
      'rsvp',
      'View Event',
      3, -- High relevance: direct involvement
      jsonb_build_object(
        'event_id', NEW.event_id, 
        'rsvp_id', NEW.id,
        'type', 'rsvp'
      )
    );
    
    RAISE LOG '[create_rsvp_notification] [%] Notification created successfully', log_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG '[create_rsvp_notification] [%] Error creating notification: %', log_id, SQLERRM;
  END;

  RETURN NEW;
END;
$function$;

-- Add the trigger back to the event_rsvps table
CREATE TRIGGER create_rsvp_notification_trigger
AFTER INSERT ON event_rsvps
FOR EACH ROW
EXECUTE FUNCTION public.create_rsvp_notification();

-- Add a comment explaining what this is for
COMMENT ON FUNCTION public.create_rsvp_notification() IS 
  'Creates a notification for the event host when someone RSVPs to their event, using natural language';
