
-- First, let's extend the notification_preferences structure in the profiles table
-- to include email notification settings

-- Update the default notification_preferences to include email settings
ALTER TABLE profiles 
ALTER COLUMN notification_preferences 
SET DEFAULT jsonb_build_object(
  'in_app', jsonb_build_object(
    'involved_only', true,
    'page_specific', jsonb_build_object(
      'events', true,
      'safety', true,
      'care', true,
      'goods', true,
      'skills', true,
      'neighbors', true
    ),
    'all_activity', false,
    'new_neighbors', true
  ),
  'email', jsonb_build_object(
    'enabled', false,
    'frequency', 'weekly',
    'types', jsonb_build_object(
      'event_rsvp', false,
      'safety_comment', false,
      'safety_emergency', true,
      'goods_response', false,
      'skill_session_request', false,
      'weekly_summary', true
    ),
    'digest_settings', jsonb_build_object(
      'day_of_week', 'Sunday',
      'time_of_day', '09:00'
    )
  )
);

-- Update existing users to have the new structure while preserving their current settings
UPDATE profiles 
SET notification_preferences = jsonb_build_object(
  'in_app', COALESCE(notification_preferences, jsonb_build_object(
    'involved_only', true,
    'page_specific', jsonb_build_object(
      'events', true,
      'safety', true,
      'care', true,
      'goods', true,
      'skills', true,
      'neighbors', true
    ),
    'all_activity', false,
    'new_neighbors', true
  )),
  'email', jsonb_build_object(
    'enabled', false,
    'frequency', 'weekly',
    'types', jsonb_build_object(
      'event_rsvp', false,
      'safety_comment', false,
      'safety_emergency', true,
      'goods_response', false,
      'skill_session_request', false,
      'weekly_summary', true
    ),
    'digest_settings', jsonb_build_object(
      'day_of_week', 'Sunday',
      'time_of_day', '09:00'
    )
  )
)
WHERE notification_preferences IS NOT NULL;

-- Create function to evaluate if user should receive email notifications
CREATE OR REPLACE FUNCTION should_user_receive_email_notification(
  p_user_id UUID,
  p_notification_type TEXT,
  p_content_type TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_prefs JSONB;
  email_enabled BOOLEAN;
  type_enabled BOOLEAN;
BEGIN
  -- Get user's notification preferences
  SELECT notification_preferences INTO user_prefs
  FROM profiles
  WHERE id = p_user_id;
  
  -- If no preferences found, return false
  IF user_prefs IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if email notifications are enabled
  email_enabled := COALESCE((user_prefs->'email'->>'enabled')::boolean, false);
  
  -- If email notifications are disabled, return false
  IF NOT email_enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Check if this specific notification type is enabled
  type_enabled := COALESCE((user_prefs->'email'->'types'->>p_notification_type)::boolean, false);
  
  RETURN type_enabled;
END;
$$;

-- Update existing notification functions to include email queueing
-- Update RSVP notification function
CREATE OR REPLACE FUNCTION create_templated_rsvp_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  notification_title TEXT;
  target_user_id UUID;
  event_title TEXT;
  actor_name TEXT;
  log_id TEXT;
  existing_notification_count INTEGER;
BEGIN
  log_id := 'RSVP_TEMPLATED_' || substr(md5(random()::text), 1, 8);
  RAISE LOG '[create_templated_rsvp_notification] [%] Starting execution for RSVP id %', log_id, NEW.id;

  SELECT e.title, e.host_id INTO event_title, target_user_id FROM events e WHERE e.id = NEW.event_id;
  
  IF target_user_id IS NULL THEN
    RAISE LOG '[create_templated_rsvp_notification] [%] No event found for RSVP, skipping notification', log_id;
    RETURN NEW;
  END IF;
  
  IF NEW.user_id = target_user_id THEN
    RAISE LOG '[create_templated_rsvp_notification] [%] User RSVPing to own event, skipping notification', log_id;
    RETURN NEW;
  END IF;

  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name FROM profiles p WHERE p.id = NEW.user_id;

  SELECT COUNT(*) INTO existing_notification_count
  FROM notifications
  WHERE user_id = target_user_id AND actor_id = NEW.user_id AND content_type = 'events' AND
        content_id = NEW.event_id AND notification_type = 'event' AND action_type = 'rsvp' AND
        created_at > (NOW() - INTERVAL '30 minutes');
    
  IF existing_notification_count > 0 THEN
    RAISE LOG '[create_templated_rsvp_notification] [%] Duplicate notification detected, skipping', log_id;
    RETURN NEW;
  END IF;

  notification_title := actor_name || ' RSVP''d to ' || event_title;

  RAISE LOG '[create_templated_rsvp_notification] [%] Creating notification: title=%, recipient=%, actor=%', log_id, notification_title, target_user_id, NEW.user_id;

  BEGIN
    -- Create in-app notification
    INSERT INTO notifications (
      user_id, actor_id, title, content_type, content_id, notification_type, action_type, action_label, relevance_score, metadata
    ) VALUES (
      target_user_id, NEW.user_id, notification_title, 'events', NEW.event_id, 'event', 'rsvp', 'View Event', 3,
      jsonb_build_object('templateId', 'event_rsvp', 'variables', jsonb_build_object('actor', actor_name, 'title', event_title), 'event_id', NEW.event_id, 'rsvp_id', NEW.id, 'type', 'rsvp')
    );
    
    -- Queue email notification if user has email notifications enabled for this type
    IF should_user_receive_email_notification(target_user_id, 'event_rsvp', 'events') THEN
      INSERT INTO email_queue (
        user_id, recipient_email, template_type, template_data, neighborhood_id
      )
      SELECT 
        target_user_id,
        au.email,
        'event-rsvp-notification',
        jsonb_build_object(
          'actor', actor_name,
          'eventTitle', event_title,
          'eventId', NEW.event_id
        ),
        (SELECT neighborhood_id FROM events WHERE id = NEW.event_id)
      FROM auth.users au
      WHERE au.id = target_user_id;
    END IF;
    
    RAISE LOG '[create_templated_rsvp_notification] [%] Templated notification created successfully', log_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG '[create_templated_rsvp_notification] [%] Error creating notification: %', log_id, SQLERRM;
  END;

  RETURN NEW;
END;
$function$;
