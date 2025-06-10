
-- Fix the create_activity function to properly handle different table schemas
CREATE OR REPLACE FUNCTION public.create_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    activity_type_val activity_type;
    content_id_val uuid;
    title_val text;
    metadata_val jsonb := '{}';
    actor_id_val uuid;
    session_id text;
BEGIN
    -- Generate a unique session ID for logging
    session_id := 'ACT_' || substr(md5(random()::text), 1, 8);
    
    RAISE LOG '[create_activity] [%] Starting execution for table % and row id %', 
        session_id, TG_TABLE_NAME, NEW.id;

    -- Set content_id to the row's ID
    content_id_val := NEW.id;
    
    -- Handle different table types and their specific user ID field names
    CASE TG_TABLE_NAME
        WHEN 'events' THEN
            activity_type_val := 'event_created';
            title_val := NEW.title;
            actor_id_val := NEW.host_id;  -- Events use host_id, not user_id
            
        WHEN 'safety_updates' THEN
            activity_type_val := 'safety_update';
            title_val := NEW.title;
            actor_id_val := NEW.author_id;  -- Safety updates use author_id
            metadata_val := jsonb_build_object('type', NEW.type);
            
        WHEN 'skills_exchange' THEN
            IF NEW.request_type = 'offer' THEN
                activity_type_val := 'skill_offered';
            ELSE
                activity_type_val := 'skill_requested';
            END IF;
            title_val := NEW.title;
            actor_id_val := NEW.user_id;  -- Skills use user_id
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
            actor_id_val := NEW.user_id;  -- Goods use user_id
            metadata_val := jsonb_build_object(
                'goods_category', NEW.goods_category,
                'request_type', NEW.request_type,
                'urgency', NEW.urgency
            );
            
        ELSE
            RAISE LOG '[create_activity] [%] Unsupported table: %', session_id, TG_TABLE_NAME;
            RETURN NEW;
    END CASE;

    -- Insert the activity record
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
        -- Don't fail the original operation, just log the error
        RETURN NEW;
END;
$$;

-- Now manually insert the missing activity for the Fresh Juice Stand event
-- First, let's get the event details
INSERT INTO activities (
    actor_id,
    activity_type,
    content_id,
    content_type,
    title,
    neighborhood_id,
    metadata,
    created_at
)
SELECT 
    e.host_id,
    'event_created'::activity_type,
    e.id,
    'events',
    e.title,
    e.neighborhood_id,
    '{}'::jsonb,
    e.created_at
FROM events e
WHERE e.id = '031f6565-afee-4629-bb17-e944560e1882'
AND NOT EXISTS (
    SELECT 1 FROM activities a 
    WHERE a.content_id = e.id 
    AND a.content_type = 'events'
);

-- Ensure the trigger is properly attached to the events table
DROP TRIGGER IF EXISTS events_activity_trigger ON events;
CREATE TRIGGER events_activity_trigger
    AFTER INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION public.create_activity();
