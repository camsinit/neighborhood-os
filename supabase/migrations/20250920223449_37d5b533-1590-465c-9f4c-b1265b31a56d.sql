-- Update activity functions to use simple activity names without actor mentions

-- Update event activity function for simpler titles
CREATE OR REPLACE FUNCTION public.create_event_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    actor_name TEXT;
    activity_title TEXT;
    log_id TEXT;
    group_name TEXT;
BEGIN
    log_id := 'EVENT_ACTIVITY_' || substr(md5(random()::text), 1, 8);
    
    RAISE LOG '[ACTIVITY_DEBUG] [%] ✅ CREATE_EVENT_ACTIVITY trigger fired for event: %', 
        log_id, NEW.id;

    -- Get the actor's display name using the correct field for events (host_id)
    SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
    FROM profiles p WHERE p.id = NEW.host_id;
    
    -- If this is a group event, get the group name and use just the event title
    IF NEW.group_id IS NOT NULL THEN
        SELECT g.name INTO group_name
        FROM groups g WHERE g.id = NEW.group_id;
        
        -- Just use the event title for group events
        activity_title := NEW.title;
    ELSE
        -- Just use the event title for regular events
        activity_title := NEW.title;
    END IF;
    
    RAISE LOG '[ACTIVITY_DEBUG] [%] Creating event activity: "%"', log_id, activity_title;

    -- Insert activity for event creation with group metadata if applicable
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
        NEW.host_id,
        'event_created'::activity_type,
        NEW.id,
        'events',
        activity_title,
        NEW.neighborhood_id,
        CASE 
            WHEN NEW.group_id IS NOT NULL THEN 
                jsonb_build_object(
                    'group_id', NEW.group_id,
                    'group_name', COALESCE(group_name, 'Unknown Group'),
                    'description', NEW.description,
                    'actor_name', actor_name
                )
            ELSE 
                jsonb_build_object(
                    'description', NEW.description,
                    'actor_name', actor_name
                )
        END,
        now()
    );

    RAISE LOG '[ACTIVITY_DEBUG] [%] ✅ Event activity created successfully', log_id;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG '[ACTIVITY_DEBUG] [%] ❌ Error in create_event_activity: %', log_id, SQLERRM;
        RETURN NEW;
END;
$function$;

-- Update skill activity function for simpler titles
CREATE OR REPLACE FUNCTION public.create_skill_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    actor_name TEXT;
    activity_title TEXT;
    log_id TEXT;
BEGIN
    log_id := 'SKILL_ACTIVITY_' || substr(md5(random()::text), 1, 8);
    
    RAISE LOG '[ACTIVITY_DEBUG] [%] ✅ CREATE_SKILL_ACTIVITY trigger fired for skill: %', 
        log_id, NEW.id;

    -- Get the actor's display name using the correct field for skills (user_id)
    SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
    FROM profiles p WHERE p.id = NEW.user_id;
    
    -- Just use the skill title
    activity_title := NEW.title;
    
    RAISE LOG '[ACTIVITY_DEBUG] [%] Creating skill activity: "%"', log_id, activity_title;

    -- Insert activity for skill creation with proper enum casting
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
        NEW.user_id,
        CASE WHEN NEW.request_type = 'offer' THEN 'skill_offered'::activity_type ELSE 'skill_requested'::activity_type END,
        NEW.id,
        'skills_exchange',
        activity_title,
        NEW.neighborhood_id,
        jsonb_build_object(
            'category', NEW.skill_category,
            'request_type', NEW.request_type,
            'actor_name', actor_name
        ),
        now()
    );

    RAISE LOG '[ACTIVITY_DEBUG] [%] ✅ Skill activity created successfully', log_id;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG '[ACTIVITY_DEBUG] [%] ❌ Error in create_skill_activity: %', log_id, SQLERRM;
        RETURN NEW;
END;
$function$;

-- Update goods activity function for simpler titles
CREATE OR REPLACE FUNCTION public.create_goods_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    actor_name TEXT;
    activity_title TEXT;
    log_id TEXT;
BEGIN
    log_id := 'GOODS_ACTIVITY_' || substr(md5(random()::text), 1, 8);
    
    RAISE LOG '[ACTIVITY_DEBUG] [%] ✅ CREATE_GOODS_ACTIVITY trigger fired for goods: %', 
        log_id, NEW.id;

    -- Get the actor's display name using the correct field for goods (user_id)
    SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
    FROM profiles p WHERE p.id = NEW.user_id;
    
    -- Just use the goods title
    activity_title := NEW.title;
    
    RAISE LOG '[ACTIVITY_DEBUG] [%] Creating goods activity: "%"', log_id, activity_title;

    -- Insert activity for goods creation with proper enum casting
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
        NEW.user_id,
        CASE WHEN NEW.request_type = 'offer' THEN 'good_shared'::activity_type ELSE 'good_requested'::activity_type END,
        NEW.id,
        'goods_exchange',
        activity_title,
        NEW.neighborhood_id,
        jsonb_build_object(
            'category', NEW.goods_category,
            'request_type', NEW.request_type,
            'actor_name', actor_name
        ),
        now()
    );

    RAISE LOG '[ACTIVITY_DEBUG] [%] ✅ Goods activity created successfully', log_id;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG '[ACTIVITY_DEBUG] [%] ❌ Error in create_goods_activity: %', log_id, SQLERRM;
        RETURN NEW;
END;
$function$;