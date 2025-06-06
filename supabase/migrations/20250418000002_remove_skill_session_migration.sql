
-- Remove the old skill session creation migration since it references non-existent tables
-- This migration file replaces the old one that was trying to create skill session functionality

-- Drop any skill session related functions that might exist
DROP FUNCTION IF EXISTS public.create_skill_session_with_timeslots(UUID, UUID, UUID, JSONB, JSONB);
DROP FUNCTION IF EXISTS public.check_minimum_dates();

-- Clean up any triggers that might reference skill sessions
-- Note: We're being safe here and only dropping if they exist
DO $$ 
BEGIN
    -- Drop trigger if it exists
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'check_minimum_dates_trigger') THEN
        DROP TRIGGER check_minimum_dates_trigger ON skill_sessions;
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        -- Table doesn't exist, which is fine
        NULL;
END $$;

-- This migration effectively removes any skill session scheduling functionality
-- since the system has moved away from this approach
