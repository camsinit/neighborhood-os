-- Update event activity function to include group information in metadata
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
    
    -- If this is a group event, get the group name and adjust the title
    IF NEW.group_id IS NOT NULL THEN
        SELECT g.name INTO group_name
        FROM groups g WHERE g.id = NEW.group_id;
        
        activity_title := actor_name || ' created ' || COALESCE(group_name, 'group') || ' ' || NEW.title;
    ELSE
        activity_title := actor_name || ' created ' || NEW.title;
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
                    'description', NEW.description
                )
            ELSE 
                jsonb_build_object('description', NEW.description)
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