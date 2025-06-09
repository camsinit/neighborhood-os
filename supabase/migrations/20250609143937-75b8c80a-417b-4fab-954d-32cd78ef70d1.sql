
-- Fix goods exchange activity creation issues
-- This migration removes duplicate triggers and fixes the create_activity function

-- Step 1: Drop the duplicate/conflicting trigger
DROP TRIGGER IF EXISTS create_good_activity ON goods_exchange;

-- Step 2: Ensure we have the correct trigger that works with all table types
-- The existing goods_exchange_activity_trigger should remain, but let's recreate it to be sure
DROP TRIGGER IF EXISTS goods_exchange_activity_trigger ON goods_exchange;

-- Step 3: Create a new, fixed trigger for goods_exchange
CREATE TRIGGER goods_exchange_activity_trigger
  AFTER INSERT ON goods_exchange
  FOR EACH ROW
  EXECUTE FUNCTION public.create_activity();

-- Step 4: Update the create_activity function to properly handle goods_exchange table
-- Replace the existing function with one that handles all table types correctly
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
    session_id text;
BEGIN
    -- Generate a unique session ID for logging
    session_id := 'ACT_' || substr(md5(random()::text), 1, 8);
    
    RAISE LOG '[create_activity] [%] Starting execution for table % and row id %', 
        session_id, TG_TABLE_NAME, NEW.id;

    -- Set content_id to the row's ID
    content_id_val := NEW.id;
    
    -- Handle different table types
    CASE TG_TABLE_NAME
        WHEN 'events' THEN
            activity_type_val := 'event_created';
            title_val := NEW.title;
            
        WHEN 'safety_updates' THEN
            activity_type_val := 'safety_update';
            title_val := NEW.title;
            metadata_val := jsonb_build_object('type', NEW.type);
            
        WHEN 'skills_exchange' THEN
            IF NEW.request_type = 'offer' THEN
                activity_type_val := 'skill_offered';
            ELSE
                activity_type_val := 'skill_requested';
            END IF;
            title_val := NEW.title;
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
        NEW.user_id,
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

-- Step 5: Add a comment explaining the fix
COMMENT ON FUNCTION public.create_activity() IS 
    'Fixed activity creation function - handles all table types without assuming event_id field exists';

-- Step 6: Verify all triggers are properly set up
-- Check that we have the right triggers on each table
DO $$
BEGIN
    -- Ensure events table has the activity trigger
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'events_activity_trigger' 
        AND tgrelid = 'events'::regclass
    ) THEN
        CREATE TRIGGER events_activity_trigger
            AFTER INSERT ON events
            FOR EACH ROW
            EXECUTE FUNCTION public.create_activity();
    END IF;
    
    -- Ensure safety_updates table has the activity trigger
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'safety_updates_activity_trigger' 
        AND tgrelid = 'safety_updates'::regclass
    ) THEN
        CREATE TRIGGER safety_updates_activity_trigger
            AFTER INSERT ON safety_updates
            FOR EACH ROW
            EXECUTE FUNCTION public.create_activity();
    END IF;
END $$;
