-- SECURITY FIX: Phase 4 - Fix remaining skill and utility functions

-- Fix remaining skill notification functions
CREATE OR REPLACE FUNCTION public.create_skill_request_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  skill_title TEXT;
  requester_name TEXT;
  requester_avatar TEXT;
  log_id TEXT;
BEGIN
  log_id := 'SKILL_REQ_' || substr(md5(random()::text), 1, 8);
  
  RAISE LOG '[create_skill_request_notification] [%] Processing new skill request for session: %', 
    log_id, NEW.id;
    
  SELECT title INTO skill_title
  FROM skills_exchange
  WHERE id = NEW.skill_id;
  
  SELECT display_name, avatar_url INTO requester_name, requester_avatar
  FROM profiles
  WHERE id = NEW.requester_id;
  
  IF requester_name IS NULL THEN
    requester_name := 'A neighbor';
  END IF;
  
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
    NEW.provider_id,
    NEW.requester_id,
    'New request for your skill: ' || COALESCE(skill_title, 'Skill sharing'),
    'skill_sessions',
    NEW.id,
    'skills',
    'request',
    'View Request',
    4,
    jsonb_build_object(
      'skillId', NEW.skill_id,
      'sessionId', NEW.id,
      'requesterId', NEW.requester_id,
      'skillTitle', skill_title,
      'neighborName', requester_name,
      'avatarUrl', requester_avatar,
      'contextType', 'skill_request',
      'actionRequired', true
    )
  );
  
  RAISE LOG '[create_skill_request_notification] [%] Notification created successfully', log_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_skill_request_notification] [%] Error creating notification: %', log_id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_templated_neighbor_join_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  neighborhood_name TEXT;
  actor_name TEXT;
  notification_title TEXT;
  log_id TEXT;
BEGIN
  log_id := 'NEIGHBOR_JOIN_' || substr(md5(random()::text), 1, 8);
  
  RAISE LOG '[create_templated_neighbor_join_notification] [%] Starting execution for new neighbor: %', 
    log_id, NEW.user_id;

  SELECT name INTO neighborhood_name
  FROM neighborhoods
  WHERE id = NEW.neighborhood_id;
  
  SELECT COALESCE(p.display_name, 'A new neighbor') INTO actor_name
  FROM profiles p WHERE p.id = NEW.user_id;

  notification_title := actor_name || ' joined your neighborhood';
  
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
    notification_title,
    NEW.neighborhood_id,
    jsonb_build_object(
      'templateId', 'neighbor_joined',
      'variables', jsonb_build_object(
        'actor', actor_name
      ),
      'action', 'join'
    )
  );
    
  PERFORM create_unified_system_notification(
    nm.user_id,
    NEW.user_id,
    notification_title,
    'neighbors',
    NEW.user_id,
    'neighbor_welcome',
    'view',
    'View Profile',
    1,
    jsonb_build_object(
      'templateId', 'neighbor_joined',
      'variables', jsonb_build_object(
        'actor', actor_name
      ),
      'action', 'join'
    )
  )
  FROM neighborhood_members nm
  WHERE nm.neighborhood_id = NEW.neighborhood_id
    AND nm.status = 'active'
    AND nm.user_id != NEW.user_id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_templated_neighbor_join_notification] [%] Error: %', log_id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_unified_system_notification(p_user_id uuid, p_actor_id uuid, p_title text, p_content_type text, p_content_id uuid, p_notification_type notification_type, p_action_type notification_action_type DEFAULT 'view'::notification_action_type, p_action_label text DEFAULT 'View'::text, p_relevance_score integer DEFAULT 1, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_notification_id UUID;
  v_existing_count INTEGER;
  v_log_id TEXT;
BEGIN
  v_log_id := 'NOTIFY_' || substr(md5(random()::text), 1, 8);
  RAISE LOG '[create_unified_system_notification] [%] Starting notification creation: recipient=%, type=%', v_log_id, p_user_id, p_notification_type;

  SELECT COUNT(*) INTO v_existing_count FROM notifications WHERE user_id = p_user_id AND content_type = p_content_type AND content_id = p_content_id AND created_at > (now() - interval '1 hour');
  
  IF v_existing_count > 0 THEN
    RAISE LOG '[create_unified_system_notification] [%] Duplicate notification detected, skipping creation', v_log_id;
    SELECT id INTO v_notification_id FROM notifications WHERE user_id = p_user_id AND content_type = p_content_type AND content_id = p_content_id AND created_at > (now() - interval '1 hour') ORDER BY created_at DESC LIMIT 1;
    RETURN v_notification_id;
  END IF;

  IF p_user_id = p_actor_id AND p_actor_id IS NOT NULL THEN
    RAISE LOG '[create_unified_system_notification] [%] Self-notification, skipping creation', v_log_id;
    RETURN NULL;
  END IF;

  INSERT INTO notifications (user_id, actor_id, title, content_type, content_id, notification_type, action_type, action_label, relevance_score, metadata) 
  VALUES (p_user_id, p_actor_id, p_title, p_content_type, p_content_id, p_notification_type, p_action_type, p_action_label, p_relevance_score, p_metadata) 
  RETURNING id INTO v_notification_id;
  
  RAISE LOG '[create_unified_system_notification] [%] Notification created successfully: id=%', v_log_id, v_notification_id;
  RETURN v_notification_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_unified_system_notification] [%] Error creating notification: %', v_log_id, SQLERRM;
    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_templated_safety_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  notification_title TEXT;
  actor_name TEXT;
  log_id TEXT;
BEGIN
  log_id := 'SAFETY_TEMPLATED_' || substr(md5(random()::text), 1, 8);
  RAISE LOG '[create_templated_safety_notification] [%] Starting execution for safety update: %', log_id, NEW.id;

  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name FROM profiles p WHERE p.id = NEW.author_id;

  IF NEW.type = 'Emergency' THEN
    notification_title := actor_name || ' reported an emergency: ' || NEW.title;
  ELSIF NEW.type = 'Suspicious Activity' THEN
    notification_title := actor_name || ' reported suspicious activity: ' || NEW.title;
  ELSE
    notification_title := actor_name || ' shared a safety update: ' || NEW.title;
  END IF;

  IF TG_OP = 'INSERT' THEN
    PERFORM create_unified_system_notification(
      nm.user_id, NEW.author_id, notification_title, 'safety', NEW.id, 'safety'::notification_type, 'view'::notification_action_type, 'View Update',
      CASE WHEN NEW.type = 'Emergency' THEN 3 WHEN NEW.type = 'Suspicious Activity' THEN 3 ELSE 2 END,
      jsonb_build_object('templateId', 'safety_update', 'variables', jsonb_build_object('actor', actor_name, 'title', NEW.title), 'safetyType', NEW.type)
    )
    FROM neighborhood_members nm
    WHERE nm.neighborhood_id = NEW.neighborhood_id AND nm.status = 'active' AND nm.user_id != NEW.author_id;
    
    RAISE LOG '[create_templated_safety_notification] [%] Safety notifications created successfully', log_id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_templated_safety_notification] [%] Error creating notification: %', log_id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_priority_score(neighbors_count integer, ai_experience text, open_source text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.update_priority_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.priority_score := public.calculate_priority_score(NEW.neighbors_to_onboard, NEW.ai_coding_experience, NEW.open_source_interest);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_share_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  
  WHILE EXISTS (SELECT 1 FROM shared_items WHERE share_code = result) LOOP
    result := '';
    FOR i IN 1..12 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
  END LOOP;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_activity_debug(activity_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin') THEN
    RAISE EXCEPTION 'Only super admins can delete activities';
  END IF;
  DELETE FROM activities WHERE id = activity_id;
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;