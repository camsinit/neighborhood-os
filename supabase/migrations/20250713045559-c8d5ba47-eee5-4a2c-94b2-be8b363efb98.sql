-- Security Fix Migration Part 2: Continue fixing function search paths

-- Continue with remaining functions that need SET search_path = 'public'

-- Function: get_user_neighborhoods
CREATE OR REPLACE FUNCTION public.get_user_neighborhoods(user_uuid uuid)
RETURNS TABLE(id uuid, name text, joined_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT n.id, n.name, nm.joined_at
  FROM neighborhoods n
  JOIN neighborhood_members nm ON n.id = nm.neighborhood_id
  WHERE nm.user_id = user_uuid AND nm.status = 'active'
  ORDER BY n.name ASC;
END;
$function$;

-- Function: is_user_in_neighborhood
CREATE OR REPLACE FUNCTION public.is_user_in_neighborhood(user_uuid uuid, neighborhood_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM neighborhood_members
    WHERE user_id = user_uuid AND neighborhood_id = neighborhood_uuid AND status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM neighborhoods
    WHERE id = neighborhood_uuid AND created_by = user_uuid
  );
END;
$function$;

-- Function: get_user_current_neighborhood
CREATE OR REPLACE FUNCTION public.get_user_current_neighborhood(user_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  neighborhood_id UUID;
BEGIN
  SELECT id INTO neighborhood_id FROM neighborhoods WHERE created_by = user_uuid LIMIT 1;
  
  IF neighborhood_id IS NULL THEN
    SELECT nm.neighborhood_id INTO neighborhood_id
    FROM neighborhood_members nm
    WHERE nm.user_id = user_uuid AND nm.status = 'active'
    LIMIT 1;
  END IF;
  
  RETURN neighborhood_id;
END;
$function$;

-- Function: backfill_neighborhood_ids
CREATE OR REPLACE FUNCTION public.backfill_neighborhood_ids()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN SELECT e.id, nm.neighborhood_id FROM events e JOIN neighborhood_members nm ON e.host_id = nm.user_id WHERE e.neighborhood_id IS NULL AND nm.status = 'active'
    LOOP
        UPDATE events SET neighborhood_id = rec.neighborhood_id WHERE id = rec.id;
    END LOOP;
    
    FOR rec IN SELECT g.id, nm.neighborhood_id FROM goods_exchange g JOIN neighborhood_members nm ON g.user_id = nm.user_id WHERE g.neighborhood_id IS NULL AND nm.status = 'active'
    LOOP
        UPDATE goods_exchange SET neighborhood_id = rec.neighborhood_id WHERE id = rec.id;
    END LOOP;
    
    FOR rec IN SELECT s.id, nm.neighborhood_id FROM safety_updates s JOIN neighborhood_members nm ON s.author_id = nm.user_id WHERE s.neighborhood_id IS NULL AND nm.status = 'active'
    LOOP
        UPDATE safety_updates SET neighborhood_id = rec.neighborhood_id WHERE id = rec.id;
    END LOOP;
    
    FOR rec IN SELECT s.id, nm.neighborhood_id FROM skills_exchange s JOIN neighborhood_members nm ON s.user_id = nm.user_id WHERE s.neighborhood_id IS NULL AND nm.status = 'active'
    LOOP
        UPDATE skills_exchange SET neighborhood_id = rec.neighborhood_id WHERE id = rec.id;
    END LOOP;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'care_requests') THEN
        FOR rec IN SELECT c.id, nm.neighborhood_id FROM care_requests c JOIN neighborhood_members nm ON c.user_id = nm.user_id WHERE c.neighborhood_id IS NULL AND nm.status = 'active'
        LOOP
            UPDATE care_requests SET neighborhood_id = rec.neighborhood_id WHERE id = rec.id;
        END LOOP;
    END IF;
END;
$function$;

-- Function: create_templated_rsvp_notification
CREATE OR REPLACE FUNCTION public.create_templated_rsvp_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
    INSERT INTO notifications (
      user_id, actor_id, title, content_type, content_id, notification_type, action_type, action_label, relevance_score, metadata
    ) VALUES (
      target_user_id, NEW.user_id, notification_title, 'events', NEW.event_id, 'event', 'rsvp', 'View Event', 3,
      jsonb_build_object('templateId', 'event_rsvp', 'variables', jsonb_build_object('actor', actor_name, 'title', event_title), 'event_id', NEW.event_id, 'rsvp_id', NEW.id, 'type', 'rsvp')
    );
    
    RAISE LOG '[create_templated_rsvp_notification] [%] Templated notification created successfully', log_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG '[create_templated_rsvp_notification] [%] Error creating notification: %', log_id, SQLERRM;
  END;

  RETURN NEW;
END;
$function$;

-- Function: get_neighborhood_from_invite
CREATE OR REPLACE FUNCTION public.get_neighborhood_from_invite(invite_code_param text)
RETURNS TABLE(neighborhood_id uuid, neighborhood_name text, neighborhood_city text, neighborhood_state text, neighborhood_created_at timestamp with time zone, member_count bigint, invitation_status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    n.id as neighborhood_id, n.name as neighborhood_name, n.city as neighborhood_city, n.state as neighborhood_state,
    n.created_at as neighborhood_created_at, COALESCE(member_counts.count, 0) as member_count, i.status as invitation_status
  FROM invitations i
  JOIN neighborhoods n ON i.neighborhood_id = n.id
  LEFT JOIN (
    SELECT nm.neighborhood_id, COUNT(*) as count 
    FROM neighborhood_members nm
    WHERE nm.status = 'active' 
    GROUP BY nm.neighborhood_id
  ) member_counts ON n.id = member_counts.neighborhood_id
  WHERE i.invite_code = invite_code_param;
END;
$function$;

-- Function: calculate_priority_score
CREATE OR REPLACE FUNCTION public.calculate_priority_score(neighbors_count integer, ai_experience text, open_source text)
RETURNS integer
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
DECLARE
  score INTEGER := 0;
BEGIN
  score := score + LEAST(neighbors_count * 2, 20);
  
  CASE ai_experience
    WHEN 'Expert' THEN score := score + 15;
    WHEN 'Advanced' THEN score := score + 12;
    WHEN 'Intermediate' THEN score := score + 8;
    WHEN 'Beginner' THEN score := score + 5;
    WHEN 'None' THEN score := score + 0;
    ELSE score := score + 0;
  END CASE;
  
  CASE open_source
    WHEN 'Very Interested' THEN score := score + 10;
    WHEN 'Interested' THEN score := score + 7;
    WHEN 'Somewhat Interested' THEN score := score + 4;
    WHEN 'Not Very Interested' THEN score := score + 2;
    WHEN 'Not Interested' THEN score := score + 0;
    ELSE score := score + 0;
  END CASE;
  
  RETURN score;
END;
$function$;