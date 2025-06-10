
-- First, let's remove the duplicate activity entry for the recent skill
-- We'll keep the first one and remove the second duplicate
WITH duplicate_activities AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY content_id, activity_type ORDER BY created_at) as rn
  FROM activities 
  WHERE content_id = '269fa8d8-e96b-4322-8a40-6b44472edf02'
    AND activity_type = 'skill_offered'
    AND created_at > NOW() - INTERVAL '10 minutes'
)
DELETE FROM activities 
WHERE id IN (
  SELECT id FROM duplicate_activities WHERE rn > 1
);

-- Now let's check what triggers exist on skills_exchange table
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'skills_exchange';

-- Clean up any duplicate triggers on skills_exchange
-- Drop all existing triggers first
DROP TRIGGER IF EXISTS skills_exchange_create_activity_trigger ON skills_exchange;
DROP TRIGGER IF EXISTS skills_exchange_activity_trigger ON skills_exchange;
DROP TRIGGER IF EXISTS skill_activity_trigger ON skills_exchange;

-- Create a single, clean trigger using the standard create_activity function
CREATE TRIGGER skills_exchange_activity_trigger
  AFTER INSERT ON skills_exchange
  FOR EACH ROW
  EXECUTE FUNCTION public.create_activity();

-- Verify we now have only one trigger
SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'skills_exchange';
