-- Fix duplicate activity triggers causing multiple entries in activity feed
-- This migration removes the older/duplicate triggers to prevent duplicate activities

-- Remove duplicate event activity triggers (keep the more specific one)
DROP TRIGGER IF EXISTS event_activity_trigger ON events;
DROP TRIGGER IF EXISTS events_activity_trigger ON events;

-- Remove duplicate safety update activity triggers (keep the specialized one)
DROP TRIGGER IF EXISTS safety_updates_activity_trigger ON safety_updates;

-- Remove duplicate skills exchange activity triggers (keep the more specific one)  
DROP TRIGGER IF EXISTS create_skill_activity ON skills_exchange;
DROP TRIGGER IF EXISTS skills_exchange_activity_trigger ON skills_exchange;

-- Re-create the correct triggers using the proper specialized functions

-- Events should use the create_event_notification function (which handles both activities and notifications)
CREATE TRIGGER create_event_notification_trigger
AFTER INSERT OR UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION public.create_event_notification();

-- Safety updates should use the specialized safety function (which already exists)
-- (safety_update_activity_trigger already exists and is correct)

-- Skills exchange should use the create_activity function with proper configuration
CREATE TRIGGER skills_exchange_activity_trigger
AFTER INSERT ON skills_exchange
FOR EACH ROW
EXECUTE FUNCTION public.create_activity();

-- Add logging to track trigger cleanup
RAISE LOG 'Duplicate activity triggers removed and corrected to prevent duplicate activities in feed';