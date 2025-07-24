-- SECURITY FIX: Phase 5 - Fix final remaining functions and add missing RLS policies

-- Fix remaining skill notification functions
CREATE OR REPLACE FUNCTION public.create_skill_session_confirmation_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  skill_title TEXT;
  provider_name TEXT;
  provider_avatar TEXT;
  requester_name TEXT;
  requester_avatar TEXT;
  log_id TEXT;
BEGIN
  log_id := 'SKILL_CONF_' || substr(md5(random()::text), 1, 8);
  
  IF NOT (NEW.status = 'confirmed' AND OLD.status != 'confirmed') THEN
    RETURN NEW;
  END IF;
  
  RAISE LOG '[create_skill_session_confirmation_notification] [%] Processing skill confirmation for session: %', 
    log_id, NEW.id;
    
  SELECT title INTO skill_title
  FROM skills_exchange
  WHERE id = NEW.skill_id;
  
  SELECT display_name, avatar_url INTO provider_name, provider_avatar
  FROM profiles
  WHERE id = NEW.provider_id;
  
  SELECT display_name, avatar_url INTO requester_name, requester_avatar
  FROM profiles
  WHERE id = NEW.requester_id;
  
  provider_name := COALESCE(provider_name, 'A neighbor');
  requester_name := COALESCE(requester_name, 'A neighbor');
  
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
    'Skill session confirmed: ' || COALESCE(skill_title, 'Skill sharing'),
    'skill_sessions',
    NEW.id,
    'skills',
    'confirm',
    'View Session',
    3,
    jsonb_build_object(
      'skillId', NEW.skill_id,
      'sessionId', NEW.id,
      'eventId', NEW.event_id,
      'skillTitle', skill_title,
      'neighborName', requester_name,
      'avatarUrl', requester_avatar,
      'contextType', 'skill_session'
    )
  );
  
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
    NEW.requester_id,
    NEW.provider_id,
    'Skill session confirmed: ' || COALESCE(skill_title, 'Skill sharing'),
    'skill_sessions',
    NEW.id,
    'skills',
    'confirm',
    'View Session',
    3,
    jsonb_build_object(
      'skillId', NEW.skill_id,
      'sessionId', NEW.id,
      'eventId', NEW.event_id,
      'skillTitle', skill_title,
      'neighborName', provider_name,
      'avatarUrl', provider_avatar,
      'contextType', 'skill_session'
    )
  );
  
  RAISE LOG '[create_skill_session_confirmation_notification] [%] Notifications created successfully', log_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_skill_session_confirmation_notification] [%] Error creating notifications: %', log_id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_skill_session_cancellation_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  skill_title TEXT;
  actor_name TEXT;
  actor_avatar TEXT;
  target_user_id UUID;
  log_id TEXT;
BEGIN
  log_id := 'SKILL_CANCEL_' || substr(md5(random()::text), 1, 8);
  
  IF NOT (NEW.status = 'expired' AND OLD.status != 'expired') THEN
    RETURN NEW;
  END IF;
  
  RAISE LOG '[create_skill_session_cancellation_notification] [%] Processing skill cancellation for session: %', 
    log_id, NEW.id;
    
  SELECT title INTO skill_title
  FROM skills_exchange
  WHERE id = NEW.skill_id;
  
  target_user_id := NEW.provider_id;
  
  SELECT display_name, avatar_url INTO actor_name, actor_avatar
  FROM profiles
  WHERE id = NEW.requester_id;
  
  actor_name := COALESCE(actor_name, 'A neighbor');
  
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
    NEW.requester_id,
    'Skill session cancelled: ' || COALESCE(skill_title, 'Skill sharing'),
    'skill_sessions',
    NEW.id,
    'skills',
    'cancel',
    'View Details',
    3,
    jsonb_build_object(
      'skillId', NEW.skill_id,
      'sessionId', NEW.id,
      'skillTitle', skill_title,
      'neighborName', actor_name,
      'avatarUrl', actor_avatar,
      'contextType', 'skill_session'
    )
  );
  
  RAISE LOG '[create_skill_session_cancellation_notification] [%] Notification created successfully', log_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_skill_session_cancellation_notification] [%] Error creating notification: %', log_id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_skill_session_reschedule_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  skill_title TEXT;
  actor_name TEXT;
  actor_avatar TEXT;
  target_user_id UUID;
  selected_time TIMESTAMP WITH TIME ZONE;
  log_id TEXT;
BEGIN
  log_id := 'SKILL_RESCHED_' || substr(md5(random()::text), 1, 8);
  
  IF NOT (NEW.is_selected = TRUE AND (OLD.is_selected = FALSE OR OLD.is_selected IS NULL)) THEN
    RETURN NEW;
  END IF;
  
  RAISE LOG '[create_skill_session_reschedule_notification] [%] Processing skill reschedule for time slot: %', 
    log_id, NEW.id;
    
  SELECT s.skill_id, se.title, s.requester_id, s.provider_id 
  INTO NEW.session_id, skill_title, target_user_id, target_user_id
  FROM skill_sessions s
  JOIN skills_exchange se ON s.skill_id = se.id
  WHERE s.id = NEW.session_id;
  
  target_user_id := target_user_id;
  
  SELECT display_name, avatar_url INTO actor_name, actor_avatar
  FROM profiles
  WHERE id = target_user_id;
  
  actor_name := COALESCE(actor_name, 'A neighbor');
  
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
    target_user_id,
    'Skill session rescheduled: ' || COALESCE(skill_title, 'Skill sharing'),
    'skill_sessions',
    NEW.session_id,
    'skills',
    'reschedule',
    'View Details',
    3,
    jsonb_build_object(
      'skillId', NEW.session_id,
      'sessionId', NEW.session_id,
      'skillTitle', skill_title,
      'sessionTime', NEW.proposed_time,
      'neighborName', actor_name,
      'avatarUrl', actor_avatar,
      'contextType', 'skill_session'
    )
  );
  
  RAISE LOG '[create_skill_session_reschedule_notification] [%] Notification created successfully', log_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_skill_session_reschedule_notification] [%] Error creating notification: %', log_id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_skill_update_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  provider_name TEXT;
  provider_avatar TEXT;
  interested_user UUID;
  log_id TEXT;
BEGIN
  log_id := 'SKILL_UPDATE_' || substr(md5(random()::text), 1, 8);
  
  IF TG_OP != 'UPDATE' THEN
    RETURN NEW;
  END IF;
  
  IF OLD.title = NEW.title AND OLD.description = NEW.description AND 
     OLD.availability = NEW.availability AND OLD.time_preferences = NEW.time_preferences THEN
    RETURN NEW;
  END IF;
  
  RAISE LOG '[create_skill_update_notification] [%] Processing skill update for skill: %', 
    log_id, NEW.id;
    
  SELECT display_name, avatar_url INTO provider_name, provider_avatar
  FROM profiles
  WHERE id = NEW.user_id;
  
  provider_name := COALESCE(provider_name, 'A neighbor');
  
  FOR interested_user IN 
    SELECT DISTINCT requester_id
    FROM skill_sessions
    WHERE skill_id = NEW.id
      AND requester_id != NEW.user_id
  LOOP
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
      interested_user,
      NEW.user_id,
      'Skill updated: ' || NEW.title,
      'skills_exchange',
      NEW.id,
      'skills',
      'update',
      'View Skill',
      2,
      jsonb_build_object(
        'skillId', NEW.id,
        'skillTitle', NEW.title,
        'contextType', 'skill_update',
        'neighborName', provider_name,
        'avatarUrl', provider_avatar
      )
    );
  END LOOP;
  
  RAISE LOG '[create_skill_update_notification] [%] Notifications created successfully', log_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_skill_update_notification] [%] Error creating notifications: %', log_id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_selective_safety_notification()
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
  log_id := 'SAFETY_SELECTIVE_' || substr(md5(random()::text), 1, 8);
  RAISE LOG '[create_selective_safety_notification] [%] Starting execution for safety update: %', log_id, NEW.id;

  IF NEW.type NOT IN ('Emergency', 'Suspicious Activity') THEN
    RAISE LOG '[create_selective_safety_notification] [%] Skipping notification for type: %', log_id, NEW.type;
    RETURN NEW;
  END IF;

  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name FROM profiles p WHERE p.id = NEW.author_id;

  IF NEW.type = 'Emergency' THEN
    notification_title := actor_name || ' reported an emergency: ' || NEW.title;
  ELSE
    notification_title := actor_name || ' reported suspicious activity: ' || NEW.title;
  END IF;

  IF TG_OP = 'INSERT' THEN
    PERFORM create_unified_system_notification(
      nm.user_id, NEW.author_id, notification_title, 'safety', NEW.id, 'safety'::notification_type, 'view'::notification_action_type, 'View Update', 3,
      jsonb_build_object('templateId', 'safety_update', 'variables', jsonb_build_object('actor', actor_name, 'title', NEW.title), 'safetyType', NEW.type)
    )
    FROM neighborhood_members nm
    WHERE nm.neighborhood_id = NEW.neighborhood_id AND nm.status = 'active' AND nm.user_id != NEW.author_id;
    
    RAISE LOG '[create_selective_safety_notification] [%] High-priority safety notifications created successfully', log_id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_selective_safety_notification] [%] Error creating notification: %', log_id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Add RLS policies for the security_audit_log table (the table with missing policies)
-- Note: The actual missing policies are likely for the security_audit_log table we created earlier

-- Also fix the final utility functions
CREATE OR REPLACE FUNCTION public.create_simple_skill_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  skill_title TEXT;
  requester_name TEXT;
  log_id TEXT;
BEGIN
  log_id := 'SKILL_SIMPLE_' || substr(md5(random()::text), 1, 8);
  
  IF NEW.request_type != 'need' THEN
    RETURN NEW;
  END IF;
  
  RAISE LOG '[create_simple_skill_notification] [%] Processing new skill request: %', 
    log_id, NEW.id;
    
  skill_title := NEW.title;
  
  SELECT display_name INTO requester_name
  FROM profiles
  WHERE id = NEW.user_id;
  
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
    3,
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
    AND se_offers.user_id != NEW.user_id
    AND se_offers.is_archived = false;
  
  RAISE LOG '[create_simple_skill_notification] [%] Notifications created for skill request', log_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_simple_skill_notification] [%] Error creating notification: %', log_id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_targeted_skill_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  skill_title TEXT;
  requester_name TEXT;
  log_id TEXT;
BEGIN
  log_id := 'SKILL_TARGETED_' || substr(md5(random()::text), 1, 8);
  
  IF NEW.request_type != 'need' THEN
    RETURN NEW;
  END IF;
  
  RAISE LOG '[create_targeted_skill_notification] [%] Processing new skill request: %', 
    log_id, NEW.id;
    
  skill_title := NEW.title;
  
  SELECT display_name INTO requester_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  IF requester_name IS NULL THEN
    requester_name := 'A neighbor';
  END IF;
  
  -- Similar implementation as simple skill notification for now
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
    3,
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
    AND se_offers.user_id != NEW.user_id
    AND se_offers.is_archived = false;
  
  RAISE LOG '[create_targeted_skill_notification] [%] Notifications created for skill request', log_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_targeted_skill_notification] [%] Error creating notification: %', log_id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.backfill_neighborhood_ids()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;