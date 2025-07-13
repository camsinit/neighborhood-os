-- Security Fix Migration Part 3: Final batch of function search path fixes

-- Continue with all remaining functions that need SET search_path = 'public'

-- Function: create_unified_system_notification
CREATE OR REPLACE FUNCTION public.create_unified_system_notification(p_user_id uuid, p_actor_id uuid, p_title text, p_content_type text, p_content_id uuid, p_notification_type notification_type, p_action_type notification_action_type DEFAULT 'view'::notification_action_type, p_action_label text DEFAULT 'View'::text, p_relevance_score integer DEFAULT 1, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- Function: create_templated_safety_notification
CREATE OR REPLACE FUNCTION public.create_templated_safety_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- Function: update_priority_score
CREATE OR REPLACE FUNCTION public.update_priority_score()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.priority_score := public.calculate_priority_score(NEW.neighbors_to_onboard, NEW.ai_coding_experience, NEW.open_source_interest);
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

-- Function: create_selective_safety_notification
CREATE OR REPLACE FUNCTION public.create_selective_safety_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- Function: create_templated_safety_comment_notification
CREATE OR REPLACE FUNCTION public.create_templated_safety_comment_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  safety_update_title TEXT;
  safety_update_author_id UUID;
  notification_title TEXT;
  actor_name TEXT;
  log_id TEXT;
  existing_notification_count INTEGER;
BEGIN
  log_id := 'SAFETY_COMMENT_' || substr(md5(random()::text), 1, 8);
  RAISE LOG '[create_templated_safety_comment_notification] [%] Starting execution for comment: %', log_id, NEW.id;

  SELECT title, author_id INTO safety_update_title, safety_update_author_id FROM safety_updates WHERE id = NEW.safety_update_id;
  
  IF safety_update_title IS NULL OR safety_update_author_id IS NULL THEN
    RAISE LOG '[create_templated_safety_comment_notification] [%] No safety update found for comment, skipping notification', log_id;
    RETURN NEW;
  END IF;
  
  IF NEW.user_id = safety_update_author_id THEN
    RAISE LOG '[create_templated_safety_comment_notification] [%] User commenting on own safety update, skipping notification', log_id;
    RETURN NEW;
  END IF;

  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name FROM profiles p WHERE p.id = NEW.user_id;

  SELECT COUNT(*) INTO existing_notification_count FROM notifications
  WHERE user_id = safety_update_author_id AND actor_id = NEW.user_id AND content_type = 'safety' AND
        content_id = NEW.safety_update_id AND notification_type = 'safety' AND action_type = 'comment' AND
        created_at > (NOW() - INTERVAL '30 minutes');
    
  IF existing_notification_count > 0 THEN
    RAISE LOG '[create_templated_safety_comment_notification] [%] Duplicate notification detected, skipping', log_id;
    RETURN NEW;
  END IF;

  notification_title := actor_name || ' commented on your ' || safety_update_title || ' report';

  RAISE LOG '[create_templated_safety_comment_notification] [%] Creating notification: title=%, recipient=%, actor=%', log_id, notification_title, safety_update_author_id, NEW.user_id;

  BEGIN
    INSERT INTO notifications (user_id, actor_id, title, content_type, content_id, notification_type, action_type, action_label, relevance_score, metadata) 
    VALUES (
      safety_update_author_id, NEW.user_id, notification_title, 'safety', NEW.safety_update_id, 'safety', 'comment', 'View Comment', 3,
      jsonb_build_object('templateId', 'safety_comment', 'variables', jsonb_build_object('actor', actor_name, 'title', safety_update_title), 'safety_update_id', NEW.safety_update_id, 'comment_id', NEW.id)
    );
    
    RAISE LOG '[create_templated_safety_comment_notification] [%] Templated notification created successfully', log_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG '[create_templated_safety_comment_notification] [%] Error creating notification: %', log_id, SQLERRM;
  END;

  RETURN NEW;
END;
$function$;