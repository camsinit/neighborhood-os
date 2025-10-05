-- Add email queueing to neighbor_joined and event_created notifications

-- Update event_created notification to include email queueing
CREATE OR REPLACE FUNCTION public.create_event_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  notification_title TEXT;
  actor_id UUID;
  actor_name TEXT;
  context_type TEXT;
  log_id TEXT;
  member_record RECORD;
BEGIN
  log_id := 'EVENT_NOTIFY_' || substr(md5(random()::text), 1, 8);

  RAISE LOG '[create_event_notification] [%] Starting execution for event: %', log_id, NEW.id;

  actor_id := NEW.host_id;

  -- Get actor name
  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
  FROM profiles p WHERE p.id = actor_id;

  notification_title := actor_name || ' created a new event: ' || NEW.title;
  context_type := 'event_created';

  -- Only create notifications for new events
  IF TG_OP = 'INSERT' THEN
    FOR member_record IN
      SELECT nm.user_id
      FROM neighborhood_members nm
      WHERE nm.neighborhood_id = NEW.neighborhood_id
        AND nm.status = 'active'
        AND nm.user_id != NEW.host_id
    LOOP
      -- Create in-app notification
      PERFORM create_unified_system_notification(
        member_record.user_id,
        actor_id,
        notification_title,
        'events',
        NEW.id,
        'event'::notification_type,
        'view'::notification_action_type,
        'View Event',
        2,
        jsonb_build_object(
          'contextType', 'event_invite',
          'eventTime', NEW.time,
          'location', NEW.location,
          'is_recurring', NEW.is_recurring
        )
      );

      -- Queue email notification
      PERFORM queue_notification_email(
        member_record.user_id,
        'event_created',
        jsonb_build_object(
          'actor', actor_name,
          'eventTitle', NEW.title,
          'eventTime', NEW.time,
          'location', NEW.location,
          'eventId', NEW.id
        ),
        NEW.neighborhood_id
      );
    END LOOP;

    RAISE LOG '[create_event_notification] [%] Event notifications created successfully', log_id;
  END IF;

  -- Handle updates to events - ONLY UPDATE ACTIVITIES, NOT NOTIFICATIONS
  IF TG_OP = 'UPDATE' THEN
    IF OLD.title != NEW.title OR OLD.time != NEW.time OR OLD.location != NEW.location THEN
      UPDATE activities
      SET title = NEW.title
      WHERE content_type = 'events' AND content_id = NEW.id;

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
    RETURN NEW;
END;
$function$;

-- Find and update the neighbor_joined notification function
-- First, let's check if there's a notify_neighbor_changes function
CREATE OR REPLACE FUNCTION public.notify_neighbor_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_neighbor_name TEXT;
  log_id TEXT;
  member_record RECORD;
BEGIN
  log_id := 'NEIGHBOR_NOTIF_' || substr(md5(random()::text), 1, 8);

  -- Only process when a new member is added (status = 'active')
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    -- Get the new neighbor's name
    SELECT COALESCE(p.display_name, 'A new neighbor') INTO new_neighbor_name
    FROM profiles p WHERE p.id = NEW.user_id;

    RAISE LOG '[notify_neighbor_changes] [%] New neighbor joined: %', log_id, new_neighbor_name;

    -- Notify all other active members in the neighborhood
    FOR member_record IN
      SELECT nm.user_id
      FROM neighborhood_members nm
      WHERE nm.neighborhood_id = NEW.neighborhood_id
        AND nm.status = 'active'
        AND nm.user_id != NEW.user_id
    LOOP
      -- Create in-app notification
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
        member_record.user_id,
        NEW.user_id,
        new_neighbor_name || ' joined your neighborhood',
        'neighbors',
        NEW.user_id,
        'neighbor_welcome'::notification_type,
        'view'::notification_action_type,
        'View Profile',
        1,
        jsonb_build_object(
          'templateId', 'neighbor_joined',
          'variables', jsonb_build_object(
            'actor', new_neighbor_name
          ),
          'neighborId', NEW.user_id
        )
      );

      -- Queue email notification
      PERFORM queue_notification_email(
        member_record.user_id,
        'neighbor_joined',
        jsonb_build_object(
          'actor', new_neighbor_name,
          'neighborId', NEW.user_id
        ),
        NEW.neighborhood_id
      );
    END LOOP;

    RAISE LOG '[notify_neighbor_changes] [%] Notifications created for new neighbor', log_id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[notify_neighbor_changes] [%] Error: %', log_id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS notify_neighbor_changes_trigger ON neighborhood_members;
CREATE TRIGGER notify_neighbor_changes_trigger
  AFTER INSERT ON neighborhood_members
  FOR EACH ROW
  EXECUTE FUNCTION notify_neighbor_changes();
