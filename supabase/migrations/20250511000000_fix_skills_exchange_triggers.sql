
-- This migration fixes the "record 'new' has no field 'event_id'" error by creating clean triggers
-- First, drop any existing triggers on the skills_exchange table
DROP TRIGGER IF EXISTS skills_exchange_create_activity_trigger ON skills_exchange;
DROP TRIGGER IF EXISTS set_skill_id ON skills_exchange;
DROP TRIGGER IF EXISTS skills_exchange_events_insert_trigger ON skills_exchange;

-- Now create a proper activity creation trigger function that doesn't reference event_id
CREATE OR REPLACE FUNCTION public.create_skill_exchange_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  activity_title TEXT;
  activity_actor_id UUID;
  activity_type activity_type;
BEGIN
  -- Set actor_id and activity type
  activity_actor_id := NEW.user_id;
  activity_title := NEW.title;
  
  -- Determine activity type based on request_type
  IF NEW.request_type = 'offer' THEN
    activity_type := 'skill_offer';
  ELSE
    activity_type := 'skill_request';
  END IF;

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
    'skills',
    activity_title,
    NEW.neighborhood_id,
    jsonb_build_object(
      'category', NEW.skill_category,
      'request_type', NEW.request_type
    )
  );

  RETURN NEW;
END;
$function$;

-- Create trigger to set skill_id if null
CREATE OR REPLACE FUNCTION public.set_skill_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.skill_id IS NULL THEN
    NEW.skill_id := gen_random_uuid();
  END IF;
  RETURN NEW;
END;
$function$;

-- Add the triggers to the skills_exchange table
CREATE TRIGGER skills_exchange_create_activity_trigger
AFTER INSERT ON skills_exchange
FOR EACH ROW
EXECUTE FUNCTION public.create_skill_exchange_activity();

CREATE TRIGGER set_skill_id
BEFORE INSERT ON skills_exchange
FOR EACH ROW
EXECUTE FUNCTION public.set_skill_id();

-- Add a comment explaining the migration
COMMENT ON FUNCTION public.create_skill_exchange_activity() IS 'Creates activity entries for skill exchange events without referencing event_id';
