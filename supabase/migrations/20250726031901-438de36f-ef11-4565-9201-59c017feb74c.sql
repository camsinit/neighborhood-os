-- Update the create_activity function to include actor display_name in activity titles
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
    
    RAISE LOG '[create_activity] [%] Starting execution for table % and row id %', 
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
            
        WHEN 'safety_updates' THEN
            activity_type_val := 'safety_update';
            verb := 'shared';
            title_val := actor_name || ' ' || verb || ' ' || NEW.title;
            actor_id_val := NEW.author_id;
            metadata_val := jsonb_build_object('type', NEW.type);
            
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
$function$;

-- Update the neighbor join notification function to use actual neighbor name
CREATE OR REPLACE FUNCTION public.create_templated_neighbor_join_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  neighborhood_name TEXT;
  actor_name TEXT;
  notification_title TEXT;
  activity_title TEXT;
  log_id TEXT;
BEGIN
  log_id := 'NEIGHBOR_JOIN_' || substr(md5(random()::text), 1, 8);
  
  RAISE LOG '[create_templated_neighbor_join_notification] [%] Starting execution for new neighbor: %', 
    log_id, NEW.user_id;

  SELECT name INTO neighborhood_name
  FROM neighborhoods
  WHERE id = NEW.neighborhood_id;
  
  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
  FROM profiles p WHERE p.id = NEW.user_id;

  notification_title := actor_name || ' joined your neighborhood';
  activity_title := actor_name || ' joined';
  
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
    activity_title,
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
$function$;

-- Update the profile update notification function
CREATE OR REPLACE FUNCTION public.create_profile_update_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_display_name TEXT;
  user_neighborhood_id UUID;
  activity_title TEXT;
  log_id TEXT;
  significant_change BOOLEAN := FALSE;
  changed_fields TEXT[] := '{}';
BEGIN
  log_id := 'PROFILE_UPDATE_' || substr(md5(random()::text), 1, 8);
  
  RAISE LOG '[create_profile_update_notification] [%] Starting execution for user: %', 
    log_id, NEW.id;

  -- Check if significant fields were updated
  IF OLD.display_name IS DISTINCT FROM NEW.display_name THEN
    significant_change := TRUE;
    changed_fields := array_append(changed_fields, 'display_name');
  END IF;
  
  IF OLD.avatar_url IS DISTINCT FROM NEW.avatar_url THEN
    significant_change := TRUE;
    changed_fields := array_append(changed_fields, 'avatar_url');
  END IF;
  
  IF OLD.bio IS DISTINCT FROM NEW.bio THEN
    significant_change := TRUE;
    changed_fields := array_append(changed_fields, 'bio');
  END IF;
  
  IF OLD.skills IS DISTINCT FROM NEW.skills THEN
    significant_change := TRUE;
    changed_fields := array_append(changed_fields, 'skills');
  END IF;
  
  -- If no significant changes, exit early
  IF NOT significant_change THEN
    RETURN NEW;
  END IF;
  
  -- Get user's display name
  user_display_name := COALESCE(NEW.display_name, 'A neighbor');
  
  -- Create proper activity title with neighbor name and verb
  activity_title := user_display_name || ' updated their profile';
  
  -- Find user's neighborhood
  SELECT neighborhood_id INTO user_neighborhood_id
  FROM neighborhood_members
  WHERE user_id = NEW.id
  AND status = 'active'
  LIMIT 1;
  
  -- If no neighborhood found, check if they created one
  IF user_neighborhood_id IS NULL THEN
    SELECT id INTO user_neighborhood_id
    FROM neighborhoods
    WHERE created_by = NEW.id
    LIMIT 1;
  END IF;
  
  -- If we found a neighborhood, create an activity
  IF user_neighborhood_id IS NOT NULL THEN
    INSERT INTO activities (
      actor_id,
      activity_type,
      content_id,
      content_type,
      title,
      neighborhood_id,
      metadata
    ) VALUES (
      NEW.id,
      'profile_updated',
      NEW.id,
      'neighbors',
      activity_title,
      user_neighborhood_id,
      jsonb_build_object(
        'neighborName', user_display_name,
        'updatedFields', changed_fields,
        'action', 'update'
      )
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_profile_update_notification] [%] Error: %', log_id, SQLERRM;
    RETURN NEW;
END;
$function$;