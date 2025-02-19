
-- Update the notify_skill_completion function to use 'schedule' action type
CREATE OR REPLACE FUNCTION public.notify_skill_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        INSERT INTO notifications (
            user_id,
            actor_id,
            title,
            content_type,
            content_id,
            notification_type,
            action_type,
            action_label,
            metadata
        )
        SELECT 
            NEW.requester_id,
            NEW.provider_id,
            'Your skill request has been completed - Schedule your session',
            'skill_session',
            NEW.id,
            'skills',
            'schedule',
            'Schedule Session',
            jsonb_build_object(
                'status', NEW.status,
                'skill_id', NEW.skill_id
            );
    END IF;
    
    RETURN NEW;
END;
$$;
