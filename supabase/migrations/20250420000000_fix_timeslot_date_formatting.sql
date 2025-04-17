
-- Fix the date parsing in the create_skill_session_with_timeslots function
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
  v_distinct_dates TEXT[];
BEGIN
  -- Validate input data
  IF p_timeslots IS NULL OR jsonb_array_length(p_timeslots) = 0 THEN
    RAISE EXCEPTION 'Time slots must be provided';
  END IF;
  
  -- Collect all normalized dates for validation
  v_distinct_dates := ARRAY[]::TEXT[];
  
  -- Log the input for debugging
  RAISE NOTICE 'Processing timeslots input: %', p_timeslots;
  
  -- Extract distinct dates using array approach (more reliable than COUNT DISTINCT)
  FOR i IN 0..jsonb_array_length(p_timeslots) - 1 LOOP
    v_slot := p_timeslots->i;
    v_date := v_slot->>'date';
    
    -- Handle various date formats by extracting just YYYY-MM-DD
    IF v_date ~ 'T' THEN
      v_date := split_part(v_date, 'T', 1);
    END IF;
    
    -- Skip already processed dates
    IF NOT v_date = ANY(v_distinct_dates) THEN
      v_distinct_dates := v_distinct_dates || v_date;
    END IF;
  END LOOP;
  
  -- Log the distinct dates found
  RAISE NOTICE 'Distinct dates found: % -> %', array_length(v_distinct_dates, 1), v_distinct_dates;
  
  -- Validate we have at least 1 unique date
  IF array_length(v_distinct_dates, 1) < 1 THEN
    RAISE EXCEPTION 'At least 1 different date must be provided (found %)', array_length(v_distinct_dates, 1);
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

  -- Insert time slots using the validated dates
  FOR i IN 0..jsonb_array_length(p_timeslots) - 1 LOOP
    v_slot := p_timeslots->i;
    v_date := v_slot->>'date';
    
    -- Handle various date formats
    IF v_date ~ 'T' THEN
      v_date := split_part(v_date, 'T', 1);
    END IF;
    
    -- Process preferences array
    IF jsonb_array_length(v_slot->'preferences') > 0 THEN
      FOR j IN 0..jsonb_array_length(v_slot->'preferences') - 1 LOOP
        -- Extract preference value, handling quoted strings
        v_preference := v_slot->'preferences'->j;
        IF v_preference::text ~ '^".*"$' THEN -- If wrapped in quotes
          v_preference := trim(both '"' from v_preference::text);
        END IF;
        
        -- Map preference to time
        CASE v_preference
          WHEN 'morning', '"morning"' THEN v_time := (v_date || ' 09:00:00')::TIMESTAMP WITH TIME ZONE;
          WHEN 'afternoon', '"afternoon"' THEN v_time := (v_date || ' 13:00:00')::TIMESTAMP WITH TIME ZONE;
          WHEN 'evening', '"evening"' THEN v_time := (v_date || ' 18:00:00')::TIMESTAMP WITH TIME ZONE;
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
      -- If no preferences, add a default time (noon)
      v_time := (v_date || ' 12:00:00')::TIMESTAMP WITH TIME ZONE;
      
      -- Insert the default time slot
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
    'message', 'Skill session created with ' || jsonb_array_length(p_timeslots)::TEXT || ' time slots (' || array_length(v_distinct_dates, 1)::TEXT || ' unique dates)'
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_skill_session_with_timeslots TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_skill_session_with_timeslots TO service_role;

-- Update the check_minimum_dates trigger function to use the same logic
CREATE OR REPLACE FUNCTION public.check_minimum_dates()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only run the check for new sessions, not updated ones
  IF TG_OP = 'INSERT' AND NEW.status = 'pending_provider_times' THEN
    -- Count distinct dates
    DECLARE
      distinct_date_count INT;
    BEGIN
      WITH distinct_dates AS (
        SELECT DATE(proposed_time) AS date_only
        FROM skill_session_time_slots
        WHERE session_id = NEW.id
        GROUP BY DATE(proposed_time)
      )
      SELECT COUNT(*) INTO distinct_date_count
      FROM distinct_dates;
      
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
