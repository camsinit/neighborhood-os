-- Phase 1: Fix Activity System Architecture
-- Create dedicated activity functions for each table

-- 1. Create dedicated activity function for events table
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
BEGIN
    log_id := 'EVENT_ACTIVITY_' || substr(md5(random()::text), 1, 8);
    
    RAISE LOG '[ACTIVITY_DEBUG] [%] ✅ CREATE_EVENT_ACTIVITY trigger fired for event: %', 
        log_id, NEW.id;

    -- Get the actor's display name using the correct field for events (host_id)
    SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
    FROM profiles p WHERE p.id = NEW.host_id;
    
    -- Create activity title
    activity_title := actor_name || ' created ' || NEW.title;
    
    RAISE LOG '[ACTIVITY_DEBUG] [%] Creating event activity: "%"', log_id, activity_title;

    -- Insert activity for event creation
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
        'event_created',
        NEW.id,
        'events',
        activity_title,
        NEW.neighborhood_id,
        jsonb_build_object(),
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

-- 2. Create dedicated activity function for skills_exchange table
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

    -- Insert activity for skill creation
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
        CASE WHEN NEW.request_type = 'offer' THEN 'skill_offered' ELSE 'skill_requested' END,
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

-- 3. Create dedicated activity function for goods_exchange table
CREATE OR REPLACE FUNCTION public.create_goods_activity()
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
    log_id := 'GOODS_ACTIVITY_' || substr(md5(random()::text), 1, 8);
    
    RAISE LOG '[ACTIVITY_DEBUG] [%] ✅ CREATE_GOODS_ACTIVITY trigger fired for goods: %', 
        log_id, NEW.id;

    -- Get the actor's display name using the correct field for goods (user_id)
    SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
    FROM profiles p WHERE p.id = NEW.user_id;
    
    -- Determine verb based on request type
    IF NEW.request_type = 'offer' THEN
        verb := 'shared';
    ELSE
        verb := 'requested';
    END IF;
    
    -- Create activity title
    activity_title := actor_name || ' ' || verb || ' ' || NEW.title;
    
    RAISE LOG '[ACTIVITY_DEBUG] [%] Creating goods activity: "%"', log_id, activity_title;

    -- Insert activity for goods creation
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
        CASE WHEN NEW.request_type = 'offer' THEN 'good_shared' ELSE 'good_requested' END,
        NEW.id,
        'goods_exchange',
        activity_title,
        NEW.neighborhood_id,
        jsonb_build_object(
            'goods_category', NEW.goods_category,
            'request_type', NEW.request_type,
            'urgency', NEW.urgency
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

-- 4. Update triggers to use the new dedicated functions
-- Drop existing triggers first
DROP TRIGGER IF EXISTS events_activity_trigger ON events;
DROP TRIGGER IF EXISTS skills_exchange_activity_trigger ON skills_exchange;
DROP TRIGGER IF EXISTS goods_exchange_activity_trigger ON goods_exchange;

-- Create new triggers with dedicated functions
CREATE TRIGGER events_activity_trigger
    AFTER INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION create_event_activity();

CREATE TRIGGER skills_exchange_activity_trigger
    AFTER INSERT ON skills_exchange
    FOR EACH ROW
    EXECUTE FUNCTION create_skill_activity();

CREATE TRIGGER goods_exchange_activity_trigger
    AFTER INSERT ON goods_exchange
    FOR EACH ROW
    EXECUTE FUNCTION create_goods_activity();

-- 5. Drop the broken generic function
DROP FUNCTION IF EXISTS public.create_activity() CASCADE;