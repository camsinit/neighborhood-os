
-- This migration fixes the ambiguous column reference issue in the create_activity function
-- by explicitly using table aliases for all column references

-- First, let's drop the existing trigger from event_rsvps if it exists
DROP TRIGGER IF EXISTS event_rsvps_create_activity_trigger ON event_rsvps;
DROP TRIGGER IF EXISTS events_create_activity_trigger ON events;

-- Note: we would normally update the create_activity function here, but to avoid modifying
-- a complex function that might have other users, we'll use a more targeted approach just for event_rsvps

-- Create a specialized function just for event_rsvps
CREATE OR REPLACE FUNCTION public.create_event_rsvp_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  activity_title TEXT;
  activity_actor_id UUID;
  activity_type activity_type;
  target_user_id UUID;
  event_neighborhood_id UUID;
  event_title TEXT;
BEGIN
  -- Get event title and neighborhood_id
  SELECT e.title, e.host_id, e.neighborhood_id 
  INTO event_title, target_user_id, event_neighborhood_id
  FROM events e
  WHERE e.id = NEW.event_id;

  -- Set actor_id and activity type
  activity_actor_id := NEW.user_id;
  activity_title := event_title;
  activity_type := 'event_rsvp';

  -- Create activity entry with explicit column references
  INSERT INTO activities (
    actor_id,
    activity_type,
    content_id,
    content_type,
    title,
    neighborhood_id,
    metadata
  ) VALUES (
    activity_actor_id,
    activity_type,
    NEW.event_id,  -- Use the event ID, not the RSVP ID
    'events',      -- This refers to the events table, not event_rsvps
    activity_title,
    event_neighborhood_id,
    '{}'::jsonb
  );

  -- Notify event host when someone RSVPs (unless they're RSVPing to their own event)
  IF target_user_id != activity_actor_id THEN
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
      activity_actor_id,
      'New RSVP for ' || activity_title,
      'events',
      NEW.event_id,
      'event',
      'view',
      'View Event',
      3, -- High relevance: direct involvement
      jsonb_build_object('type', 'rsvp')
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Now add the trigger specifically for event_rsvps
CREATE TRIGGER event_rsvps_create_activity_trigger
AFTER INSERT ON event_rsvps
FOR EACH ROW
EXECUTE FUNCTION public.create_event_rsvp_activity();
