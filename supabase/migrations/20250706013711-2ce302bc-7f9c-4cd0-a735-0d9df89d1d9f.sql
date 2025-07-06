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

-- Re-create the single correct trigger for skills exchange
CREATE TRIGGER skills_exchange_activity_trigger
AFTER INSERT ON skills_exchange
FOR EACH ROW
EXECUTE FUNCTION public.create_activity();

-- Note: Events now rely on create_event_notification_trigger which already exists
-- Note: Safety updates rely on safety_update_activity_trigger which already exists
-- Note: Goods exchange has goods_exchange_activity_trigger which is correct