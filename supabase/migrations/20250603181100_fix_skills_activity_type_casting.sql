
-- Fix the skills exchange activity trigger to properly cast activity types
-- This resolves the "column activity_type is of type activity_type but expression is of type text" error

CREATE OR REPLACE FUNCTION public.create_skill_exchange_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  activity_title TEXT;
  activity_actor_id UUID;
  activity_type_value activity_type;
BEGIN
  -- Set actor_id and activity type
  activity_actor_id := NEW.user_id;
  activity_title := NEW.title;
  
  -- Determine activity type based on request_type and cast to proper enum
  IF NEW.request_type = 'offer' THEN
    activity_type_value := 'skill_offered'::activity_type;
  ELSE
    activity_type_value := 'skill_requested'::activity_type;
  END IF;

  -- Add detailed trace logs
  RAISE LOG 'Creating activity for skill: % (ID: %), type: %', NEW.title, NEW.id, activity_type_value;

  -- Create activity entry with properly cast activity_type
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
    activity_type_value,
    NEW.id,
    'skills_exchange',
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

-- Add a comment explaining the fix
COMMENT ON FUNCTION public.create_skill_exchange_activity() IS 
  'Creates activity entries for skill exchange events with proper activity_type enum casting';
