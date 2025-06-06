
-- Create a function to handle creating a contribution session with timeslots in a single transaction
CREATE OR REPLACE FUNCTION public.create_contribution_session_with_timeslots(
  p_skill_id UUID,
  p_provider_id UUID,
  p_requester_id UUID,
  p_location_preference TEXT,
  p_location_details TEXT,
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
    location_preference,
    location_details,
    status,
    requester_availability
  ) VALUES (
    p_skill_id,
    p_provider_id,
    p_requester_id,
    p_location_preference,
    p_location_details,
    'pending_provider_times',
    '{}'::JSONB
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
    'message', 'Contribution session created with ' || jsonb_array_length(p_timeslots)::TEXT || ' time slots'
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_contribution_session_with_timeslots TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_contribution_session_with_timeslots TO service_role;
