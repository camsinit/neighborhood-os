-- Add minimal logging to database triggers for debugging notification/activity creation

-- Enhanced logging for group member activities and notifications
CREATE OR REPLACE FUNCTION public.create_group_member_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  actor_name TEXT;
  group_name TEXT;
  activity_title TEXT;
  log_id TEXT;
BEGIN
  log_id := 'GROUP_MEMBER_ACTIVITY_' || substr(md5(random()::text), 1, 8);
  
  RAISE LOG '[ACTIVITY_DEBUG] [%] ✅ GROUP_MEMBER_ACTIVITY trigger fired for user: % joining group: %', 
    log_id, NEW.user_id, NEW.group_id;
  
  -- Get actor name and group name
  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
  FROM profiles p WHERE p.id = NEW.user_id;
  
  SELECT name INTO group_name
  FROM groups WHERE id = NEW.group_id;
  
  activity_title := actor_name || ' joined ' || group_name;
  
  RAISE LOG '[ACTIVITY_DEBUG] [%] Creating activity: "%"', log_id, activity_title;
  
  -- Insert activity for group member joining
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
    'group_member_joined',
    NEW.group_id,
    'groups',
    activity_title,
    (SELECT neighborhood_id FROM groups WHERE id = NEW.group_id),
    jsonb_build_object(
      'groupId', NEW.group_id,
      'groupName', group_name,
      'memberRole', NEW.role
    )
  );
  
  RAISE LOG '[ACTIVITY_DEBUG] [%] ✅ Activity created successfully for group join', log_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[ACTIVITY_DEBUG] [%] ❌ Error creating group member activity: %', log_id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Enhanced logging for group member notifications
CREATE OR REPLACE FUNCTION public.create_group_member_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  actor_name TEXT;
  group_name TEXT;
  notification_title TEXT;
  log_id TEXT;
  notification_count INTEGER := 0;
BEGIN
  log_id := 'GROUP_MEMBER_NOTIF_' || substr(md5(random()::text), 1, 8);
  
  RAISE LOG '[NOTIFICATION_DEBUG] [%] ✅ GROUP_MEMBER_NOTIFICATION trigger fired for user: % joining group: %', 
    log_id, NEW.user_id, NEW.group_id;
  
  -- Get actor name and group name
  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
  FROM profiles p WHERE p.id = NEW.user_id;
  
  SELECT name INTO group_name
  FROM groups WHERE id = NEW.group_id;
  
  notification_title := actor_name || ' joined ' || group_name;
  
  RAISE LOG '[NOTIFICATION_DEBUG] [%] Creating notifications for group managers with title: "%"', 
    log_id, notification_title;
  
  -- Notify group managers (owners and moderators) only
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
    gm.user_id,
    NEW.user_id,
    notification_title,
    'groups',
    NEW.group_id,
    'groups'::notification_type,
    'view'::notification_action_type,
    'View Group',
    2,
    jsonb_build_object(
      'templateId', 'group_member_joined',
      'variables', jsonb_build_object(
        'actor', actor_name,
        'groupName', group_name
      ),
      'groupId', NEW.group_id
    )
  FROM group_members gm
  WHERE gm.group_id = NEW.group_id
    AND gm.role IN ('owner', 'moderator')
    AND gm.user_id != NEW.user_id;
  
  GET DIAGNOSTICS notification_count = ROW_COUNT;
  
  RAISE LOG '[NOTIFICATION_DEBUG] [%] ✅ Created % notifications for group managers', 
    log_id, notification_count;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[NOTIFICATION_DEBUG] [%] ❌ Error creating group member notifications: %', 
      log_id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Enhanced logging for event creation activity
CREATE OR REPLACE FUNCTION public.create_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    activity_type_val activity_type;
    content_id_val uuid;
    title_val text;
    metadata_val jsonb := '{}';
    actor_id_val uuid;
    actor_name text;
    verb text;
    session_id text;
BEGIN
    session_id := 'ACT_' || substr(md5(random()::text), 1, 8);
    
    RAISE LOG '[ACTIVITY_DEBUG] [%] ✅ CREATE_ACTIVITY trigger fired for table % and row id %', 
        session_id, TG_TABLE_NAME, NEW.id;

    content_id_val := NEW.id;
    
    -- Get the actor's display name
    SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
    FROM profiles p WHERE p.id = NEW.host_id OR p.id = NEW.author_id OR p.id = NEW.user_id
    LIMIT 1;
    
    CASE TG_TABLE_NAME
        WHEN 'events' THEN
            activity_type_val := 'event_created';
            verb := 'created';
            title_val := actor_name || ' ' || verb || ' ' || NEW.title;
            actor_id_val := NEW.host_id;
            RAISE LOG '[ACTIVITY_DEBUG] [%] Processing EVENT creation: "%"', session_id, title_val;
            
        WHEN 'safety_updates' THEN
            activity_type_val := 'safety_update';
            verb := 'shared';
            title_val := actor_name || ' ' || verb || ' ' || NEW.title;
            actor_id_val := NEW.author_id;
            metadata_val := jsonb_build_object('type', NEW.type);
            RAISE LOG '[ACTIVITY_DEBUG] [%] Processing SAFETY UPDATE: "%"', session_id, title_val;
            
        WHEN 'skills_exchange' THEN
            actor_id_val := NEW.user_id;
            IF NEW.request_type = 'offer' THEN
                activity_type_val := 'skill_offered';
                verb := 'offered';
            ELSE
                activity_type_val := 'skill_requested';
                verb := 'requested';
            END IF;
            title_val := actor_name || ' ' || verb || ' ' || NEW.title;
            metadata_val := jsonb_build_object(
                'category', NEW.skill_category,
                'request_type', NEW.request_type
            );
            RAISE LOG '[ACTIVITY_DEBUG] [%] Processing SKILL %: "%"', session_id, NEW.request_type, title_val;
            
        WHEN 'goods_exchange' THEN
            actor_id_val := NEW.user_id;
            IF NEW.request_type = 'offer' THEN
                activity_type_val := 'good_shared';
                verb := 'shared';
            ELSE
                activity_type_val := 'good_requested';
                verb := 'requested';
            END IF;
            title_val := actor_name || ' ' || verb || ' ' || NEW.title;
            metadata_val := jsonb_build_object(
                'goods_category', NEW.goods_category,
                'request_type', NEW.request_type,
                'urgency', NEW.urgency
            );
            RAISE LOG '[ACTIVITY_DEBUG] [%] Processing GOODS %: "%"', session_id, NEW.request_type, title_val;
            
        ELSE
            RAISE LOG '[ACTIVITY_DEBUG] [%] ❌ Unsupported table: %', session_id, TG_TABLE_NAME;
            RETURN NEW;
    END CASE;

    RAISE LOG '[ACTIVITY_DEBUG] [%] Inserting activity with type: %', session_id, activity_type_val;

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

    RAISE LOG '[ACTIVITY_DEBUG] [%] ✅ Activity created successfully for % with type %', 
        session_id, TG_TABLE_NAME, activity_type_val;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG '[ACTIVITY_DEBUG] [%] ❌ Error in create_activity: %', session_id, SQLERRM;
        RETURN NEW;
END;
$function$;