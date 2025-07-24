-- SECURITY FIX: Phase 3 - Fix remaining notification and trigger functions

-- Fix all remaining trigger and notification functions with proper search_path
CREATE OR REPLACE FUNCTION public.create_templated_safety_comment_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.create_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    activity_type_val activity_type;
    content_id_val uuid;
    title_val text;
    metadata_val jsonb := '{}';
    actor_id_val uuid;
    session_id text;
BEGIN
    session_id := 'ACT_' || substr(md5(random()::text), 1, 8);
    
    RAISE LOG '[create_activity] [%] Starting execution for table % and row id %', 
        session_id, TG_TABLE_NAME, NEW.id;

    content_id_val := NEW.id;
    
    CASE TG_TABLE_NAME
        WHEN 'events' THEN
            activity_type_val := 'event_created';
            title_val := NEW.title;
            actor_id_val := NEW.host_id;
            
        WHEN 'safety_updates' THEN
            activity_type_val := 'safety_update';
            title_val := NEW.title;
            actor_id_val := NEW.author_id;
            metadata_val := jsonb_build_object('type', NEW.type);
            
        WHEN 'skills_exchange' THEN
            IF NEW.request_type = 'offer' THEN
                activity_type_val := 'skill_offered';
            ELSE
                activity_type_val := 'skill_requested';
            END IF;
            title_val := NEW.title;
            actor_id_val := NEW.user_id;
            metadata_val := jsonb_build_object(
                'category', NEW.skill_category,
                'request_type', NEW.request_type
            );
            
        WHEN 'goods_exchange' THEN
            IF NEW.request_type = 'offer' THEN
                activity_type_val := 'good_shared';
            ELSE
                activity_type_val := 'good_requested';
            END IF;
            title_val := NEW.title;
            actor_id_val := NEW.user_id;
            metadata_val := jsonb_build_object(
                'goods_category', NEW.goods_category,
                'request_type', NEW.request_type,
                'urgency', NEW.urgency
            );
            
        ELSE
            RAISE LOG '[create_activity] [%] Unsupported table: %', session_id, TG_TABLE_NAME;
            RETURN NEW;
    END CASE;

    INSERT INTO activities (
        actor_id,
        activity_type,
        content_id,
        content_type,
        title,
        neighborhood_id,
        metadata,
        created_at
    ) VALUES (
        actor_id_val,
        activity_type_val,
        content_id_val,
        TG_TABLE_NAME,
        title_val,
        NEW.neighborhood_id,
        metadata_val,
        now()
    );

    RAISE LOG '[create_activity] [%] Activity created successfully for % with type %', 
        session_id, TG_TABLE_NAME, activity_type_val;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG '[create_activity] [%] Error in create_activity: %', session_id, SQLERRM;
        RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_neighborhood_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO neighborhood_roles (user_id, neighborhood_id, role, assigned_by)
  VALUES (NEW.created_by, NEW.id, 'admin', NEW.created_by);
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_neighborhood_roles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_skill_contributors_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_email_queue_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_safety_update_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  activity_title TEXT;
  log_id TEXT;
BEGIN
  log_id := 'SAFETY_ACTIVITY_' || substr(md5(random()::text), 1, 8);
  RAISE LOG '[create_safety_update_activity] [%] Starting execution for safety update: %', log_id, NEW.id;
  activity_title := NEW.title;

  INSERT INTO activities (
    actor_id, activity_type, content_id, content_type, title, neighborhood_id, metadata
  ) VALUES (
    NEW.author_id, 'safety_update', NEW.id, 'safety_updates', activity_title, NEW.neighborhood_id,
    jsonb_build_object('type', NEW.type, 'description', COALESCE(NEW.description, ''))
  );

  RAISE LOG '[create_safety_update_activity] [%] Activity created successfully for safety update: %', log_id, NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_safety_update_activity] [%] Error: %', log_id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_multiple_neighborhoods()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM neighborhood_members WHERE user_id = NEW.created_by AND status = 'active') THEN
    RAISE EXCEPTION 'User is already a member of a neighborhood and cannot create another one';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_multiple_memberships()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM neighborhoods WHERE created_by = NEW.user_id) THEN
    RAISE EXCEPTION 'User has already created a neighborhood and cannot join another one';
  END IF;
  RETURN NEW;
END;
$$;