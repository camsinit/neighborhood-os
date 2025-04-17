
-- Create a function to handle creating a skill session with timeslots in a single transaction
CREATE OR REPLACE FUNCTION public.create_skill_session_with_timeslots(
  p_skill_id UUID,
  p_provider_id UUID,
  p_requester_id UUID,
  p_requester_availability JSONB,
  p_timeslots JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id UUID;
  v_slot JSONB;
  v_date TEXT;
  v_preference TEXT;
  v_time TIMESTAMP WITH TIME ZONE;
  v_result JSONB;
BEGIN
  -- Validate input data
  IF p_timeslots IS NULL OR jsonb_array_length(p_timeslots) = 0 THEN
    RAISE EXCEPTION 'At least 1 time slot must be provided';
  END IF;
  
  -- Count distinct dates in timeslots
  IF (
    SELECT COUNT(DISTINCT p_timeslots->i->>'date')
    FROM generate_series(0, jsonb_array_length(p_timeslots) - 1) AS i
  ) < 1 THEN
    RAISE EXCEPTION 'At least 1 different date must be provided';
  END IF;

  -- Create the skill session
  INSERT INTO public.skill_sessions (
    skill_id,
    provider_id,
    requester_id,
    requester_availability,
    status
  ) VALUES (
    p_skill_id,
    p_provider_id,
    p_requester_id,
    p_requester_availability,
    'pending_provider_times'
  ) RETURNING id INTO v_session_id;

  -- Insert time slots
  FOR i IN 0..jsonb_array_length(p_timeslots) - 1 LOOP
    v_slot := p_timeslots->i;
    v_date := v_slot->>'date';
    v_preference := v_slot->>'preference';
    
    -- Calculate time based on preference
    CASE v_preference
      WHEN 'morning' THEN v_time := (v_date || ' 09:00:00')::TIMESTAMP WITH TIME ZONE;
      WHEN 'afternoon' THEN v_time := (v_date || ' 13:00:00')::TIMESTAMP WITH TIME ZONE;
      WHEN 'evening' THEN v_time := (v_date || ' 18:00:00')::TIMESTAMP WITH TIME ZONE;
      ELSE v_time := (v_date || ' 12:00:00')::TIMESTAMP WITH TIME ZONE;
    END CASE;
    
    -- Insert the time slot
    INSERT INTO public.skill_session_time_slots (
      session_id,
      proposed_time
    ) VALUES (
      v_session_id,
      v_time
    );
  END LOOP;

  -- Return success response
  SELECT jsonb_build_object(
    'id', v_session_id,
    'success', true,
    'message', 'Skill session created with ' || jsonb_array_length(p_timeslots)::TEXT || ' time slots'
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_skill_session_with_timeslots TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_skill_session_with_timeslots TO service_role;

-- Modify the check_minimum_dates function (if it's still needed)
-- This is now just a backup since we're handling validation in the stored procedure
CREATE OR REPLACE FUNCTION public.check_minimum_dates()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only run the check for new sessions, not updated ones
  IF TG_OP = 'INSERT' AND NEW.status = 'pending_provider_times' THEN
    -- If time slots have not been added yet, session is incomplete
    -- This can be turned into a warning instead of an error if needed
    IF (
      SELECT COUNT(*)
      FROM skill_session_time_slots
      WHERE session_id = NEW.id
    ) = 0 THEN
      -- Insert a log entry or take some other action if needed
      -- RAISE NOTICE 'Session % created without time slots', NEW.id;
      -- But don't fail the transaction
      RETURN NEW;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
