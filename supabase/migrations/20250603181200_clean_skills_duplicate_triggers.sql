
-- Clean up duplicate triggers on skills_exchange table (corrected version)
-- This migration removes redundant triggers that are causing duplicate activity notifications

-- First, drop ALL triggers on skills_exchange that depend on the function
DROP TRIGGER IF EXISTS skills_exchange_create_activity_trigger ON skills_exchange;
DROP TRIGGER IF EXISTS skill_activity_trigger ON skills_exchange;
DROP TRIGGER IF EXISTS set_skill_id ON skills_exchange;

-- Now drop the redundant function with CASCADE to handle any remaining dependencies
DROP FUNCTION IF EXISTS public.create_skill_exchange_activity() CASCADE;

-- Also drop the set_skill_id function if it exists and isn't needed
DROP FUNCTION IF EXISTS public.set_skill_id() CASCADE;

-- Now create a single, clean trigger that uses the same create_activity function as events
-- This ensures skills work exactly like events with no duplicates
CREATE TRIGGER skills_exchange_activity_trigger
  AFTER INSERT ON skills_exchange
  FOR EACH ROW
  EXECUTE FUNCTION public.create_activity();

-- Add a comment explaining the fix
COMMENT ON TRIGGER skills_exchange_activity_trigger ON skills_exchange IS 
  'Single activity trigger for skills_exchange - prevents duplicate notifications, uses same pattern as events';
