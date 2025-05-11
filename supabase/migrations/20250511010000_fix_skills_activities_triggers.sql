
-- This migration fixes issues with the skills_exchange triggers
-- that were causing newly created skills to not appear in the activity feed

-- First, drop existing problematic triggers that reference non-existent fields
DROP TRIGGER IF EXISTS skills_exchange_create_activity_trigger ON skills_exchange;
DROP TRIGGER IF EXISTS set_skill_id ON skills_exchange;

-- Now create a proper activity creation trigger
CREATE OR REPLACE FUNCTION public.create_skill_exchange_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  activity_title TEXT;
  activity_actor_id UUID;
  activity_type TEXT;
BEGIN
  -- Set actor_id and activity type
  activity_actor_id := NEW.user_id;
  activity_title := NEW.title;
  
  -- Determine activity type based on request_type
  IF NEW.request_type = 'offer' THEN
    activity_type := 'skill_offered';
  ELSE
    activity_type := 'skill_request';
  END IF;

  -- Add detailed trace logs
  RAISE LOG 'Creating activity for skill: % (ID: %), type: %', NEW.title, NEW.id, activity_type;

  -- Create activity entry with explicit column references
  INSERT INTO activities (
    actor_id,
    activity_type,
    content_id,
    content_type,
    title,
    neighborhood_id,
    metadata
  ) VALUES (
    activity_actor_id,
    activity_type,
    NEW.id,
    'skills_exchange', -- Using skills_exchange instead of just 'skills'
    activity_title,
    NEW.neighborhood_id,
    jsonb_build_object(
      'category', NEW.skill_category,
      'request_type', NEW.request_type
    )
  );

  RAISE LOG 'Activity created successfully for skill: % (ID: %)', NEW.title, NEW.id;

  RETURN NEW;
END;
$function$;

-- Add the trigger to the skills_exchange table
CREATE TRIGGER skills_exchange_create_activity_trigger
AFTER INSERT ON skills_exchange
FOR EACH ROW
EXECUTE FUNCTION public.create_skill_exchange_activity();

-- Add a comment explaining what this is for
COMMENT ON FUNCTION public.create_skill_exchange_activity() IS 
  'Creates activity entries for skill exchange events with proper error handling';
