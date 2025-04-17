
-- Create a function to handle creating a skill session with timeslots in a single transaction
-- WITH CRITICAL FIX for date parsing
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
  v_unique_dates INT;
BEGIN
  -- Log input for debugging
  RAISE NOTICE 'Processing timeslots: %', p_timeslots;
  
  -- Validate input data
  IF p_timeslots IS NULL OR jsonb_array_length(p_timeslots) = 0 THEN
    RAISE EXCEPTION 'Time slots must be provided';
  END IF;
  
  -- CRITICAL FIX: Improved distinct date counting logic
  -- Extract distinct dates directly from the array
  SELECT COUNT(DISTINCT (t->>'date')::TEXT)
  INTO v_unique_dates
  FROM jsonb_array_elements(p_timeslots) AS t;
  
  RAISE NOTICE 'Unique dates found: %', v_unique_dates;
  
  -- Validate at least 1 unique date
  IF v_unique_dates < 1 THEN
    RAISE EXCEPTION 'At least 1 different date must be provided (found %)', v_unique_dates;
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
    
    -- For each preference in the array, create a time slot
    IF jsonb_array_length(v_slot->'preferences') > 0 THEN
      FOR j IN 0..jsonb_array_length(v_slot->'preferences') - 1 LOOP
        v_preference := v_slot->'preferences'->j;
        
        -- Remove any time component from date if present
        IF position('T' in v_date) > 0 THEN
          v_date := split_part(v_date, 'T', 1);
        END IF;
        
        -- CRITICAL FIX: More robust date handling
        -- Ensure v_date is in YYYY-MM-DD format
        IF NOT v_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
          RAISE EXCEPTION 'Invalid date format: %. Expected YYYY-MM-DD.', v_date;
        END IF;
        
        -- Calculate time based on preference
        CASE v_preference
          WHEN '"morning"' THEN v_time := (v_date || ' 09:00:00')::TIMESTAMP WITH TIME ZONE;
          WHEN '"afternoon"' THEN v_time := (v_date || ' 13:00:00')::TIMESTAMP WITH TIME ZONE;
          WHEN '"evening"' THEN v_time := (v_date || ' 18:00:00')::TIMESTAMP WITH TIME ZONE;
          WHEN 'morning' THEN v_time := (v_date || ' 09:00:00')::TIMESTAMP WITH TIME ZONE;
          WHEN 'afternoon' THEN v_time := (v_date || ' 13:00:00')::TIMESTAMP WITH TIME ZONE;
          WHEN 'evening' THEN v_time := (v_date || ' 18:00:00')::TIMESTAMP WITH TIME ZONE;
          ELSE v_time := (v_date || ' 12:00:00')::TIMESTAMP WITH TIME ZONE;
        END CASE;
        
        RAISE NOTICE 'Inserting time slot: date=%, preference=%, time=%', v_date, v_preference, v_time;
        
        -- Insert the time slot
        INSERT INTO public.skill_session_time_slots (
          session_id,
          proposed_time
        ) VALUES (
          v_session_id,
          v_time
        );
      END LOOP;
    ELSE
      -- If no preferences, still add a default time (noon)
      -- CRITICAL FIX: More robust date handling
      IF position('T' in v_date) > 0 THEN
        v_date := split_part(v_date, 'T', 1);
      END IF;
      
      -- Ensure v_date is in YYYY-MM-DD format
      IF NOT v_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
        RAISE EXCEPTION 'Invalid date format: %. Expected YYYY-MM-DD.', v_date;
      END IF;
      
      v_time := (v_date || ' 12:00:00')::TIMESTAMP WITH TIME ZONE;
      
      -- Insert the time slot
      INSERT INTO public.skill_session_time_slots (
        session_id,
        proposed_time
      ) VALUES (
        v_session_id,
        v_time
      );
    END IF;
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

-- Modify the check_minimum_dates function to be more lenient 
-- and provide better error information
CREATE OR REPLACE FUNCTION public.check_minimum_dates()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only run the check for new sessions, not updated ones
  IF TG_OP = 'INSERT' AND NEW.status = 'pending_provider_times' THEN
    -- Log the session ID for debugging
    RAISE NOTICE 'Checking minimum dates for session: %', NEW.id;
    
    -- Count distinct dates
    DECLARE
      distinct_date_count INT;
    BEGIN
      SELECT COUNT(DISTINCT DATE(proposed_time))
      INTO distinct_date_count
      FROM skill_session_time_slots
      WHERE session_id = NEW.id;
      
      RAISE NOTICE 'Found % distinct dates for session %', distinct_date_count, NEW.id;
      
      -- We now require just 1 date minimum
      IF distinct_date_count < 1 THEN
        RAISE EXCEPTION 'At least 1 different date must be provided (found %)', distinct_date_count;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_skill_session_with_timeslots TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_skill_session_with_timeslots TO service_role;
