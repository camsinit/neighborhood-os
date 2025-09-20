-- Fix activity_type enum casting in skill activity function
CREATE OR REPLACE FUNCTION public.create_skill_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    actor_name TEXT;
    activity_title TEXT;
    verb TEXT;
    log_id TEXT;
BEGIN
    log_id := 'SKILL_ACTIVITY_' || substr(md5(random()::text), 1, 8);
    
    RAISE LOG '[ACTIVITY_DEBUG] [%] ✅ CREATE_SKILL_ACTIVITY trigger fired for skill: %', 
        log_id, NEW.id;

    -- Get the actor's display name using the correct field for skills (user_id)
    SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
    FROM profiles p WHERE p.id = NEW.user_id;
    
    -- Determine verb based on request type
    IF NEW.request_type = 'offer' THEN
        verb := 'offered';
    ELSE
        verb := 'requested';
    END IF;
    
    -- Create activity title
    activity_title := actor_name || ' ' || verb || ' ' || NEW.title;
    
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
            'request_type', NEW.request_type
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