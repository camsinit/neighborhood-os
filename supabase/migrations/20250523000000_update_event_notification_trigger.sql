
-- This migration modifies the event notification trigger to not create notifications for event updates
-- Instead, it will only create activities in the feed

-- Update the event notification trigger
CREATE OR REPLACE FUNCTION public.create_event_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  notification_title TEXT;
  actor_id UUID;
  context_type TEXT;
  log_id TEXT;
BEGIN
  -- Generate a transaction ID for logging
  log_id := 'EVENT_NOTIFY_' || substr(md5(random()::text), 1, 8);
  
  -- Log the start of function execution
  RAISE LOG '[create_event_notification] [%] Starting execution for event: %', log_id, NEW.id;

  -- Set parameters based on the event
  actor_id := NEW.host_id;
  notification_title := 'New event: ' || NEW.title;
  context_type := 'event_created';
  
  -- Only create notifications for new events
  IF TG_OP = 'INSERT' THEN
    -- Using create_unified_system_notification for consistency
    -- This function already prevents self-notifications
    PERFORM create_unified_system_notification(
      nm.user_id,                 -- recipient
      actor_id,                   -- actor
      notification_title,         -- title
      'events',                   -- content_type
      NEW.id,                     -- content_id
      'event'::notification_type, -- notification_type
      'view'::notification_action_type, -- action_type
      'View Event',               -- action_label
      2,                          -- relevance score (medium)
      jsonb_build_object(
        'contextType', 'event_invite',
        'eventTime', NEW.time,
        'location', NEW.location,
        'is_recurring', NEW.is_recurring
      )                           -- metadata
    )
    FROM neighborhood_members nm
    WHERE nm.neighborhood_id = NEW.neighborhood_id
      AND nm.status = 'active'
      AND nm.user_id != NEW.host_id;  -- Don't notify the host
    
    RAISE LOG '[create_event_notification] [%] Event notifications created successfully', log_id;
  END IF;
  
  -- Handle updates to events - ONLY UPDATE ACTIVITIES, NOT NOTIFICATIONS
  IF TG_OP = 'UPDATE' THEN
    -- If important fields changed (title, time, location)
    IF OLD.title != NEW.title OR OLD.time != NEW.time OR OLD.location != NEW.location THEN
      -- Update any related activities to keep them in sync
      UPDATE activities
      SET title = NEW.title
      WHERE content_type = 'events' AND content_id = NEW.id;
      
      -- Create an activity about the event update
      INSERT INTO activities (
        actor_id,
        activity_type,
        content_id,
        content_type,
        title,
        neighborhood_id,
        metadata
      ) VALUES (
        actor_id,
        'event_updated'::activity_type,
        NEW.id,
        'events',
        'Event updated: ' || NEW.title,
        NEW.neighborhood_id,
        jsonb_build_object(
          'eventTime', NEW.time,
          'location', NEW.location,
          'changes', CASE 
            WHEN OLD.title != NEW.title AND OLD.time != NEW.time THEN 'title and time'
            WHEN OLD.title != NEW.title AND OLD.location != NEW.location THEN 'title and location'
            WHEN OLD.time != NEW.time AND OLD.location != NEW.location THEN 'time and location'
            WHEN OLD.title != NEW.title THEN 'title'
            WHEN OLD.time != NEW.time THEN 'time'
            WHEN OLD.location != NEW.location THEN 'location'
            ELSE 'details'
          END
        )
      );
      
      RAISE LOG '[create_event_notification] [%] Related activities updated', log_id;
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_event_notification] [%] Error creating notification: %', log_id, SQLERRM;
    RETURN NEW; -- Return NEW even on error to prevent transaction failure
END;
$function$;

-- Update the comment to reflect the changes
COMMENT ON FUNCTION public.create_event_notification() IS 
  'Creates notifications for new events and updates activities for event changes';

-- Make sure the trigger is attached to the events table
DROP TRIGGER IF EXISTS create_event_notification_trigger ON events;
CREATE TRIGGER create_event_notification_trigger
AFTER INSERT OR UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION public.create_event_notification();
