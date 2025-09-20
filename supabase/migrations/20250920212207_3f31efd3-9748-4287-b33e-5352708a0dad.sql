-- Update notification system based on user feedback

-- 1. Update group member notification to notify ALL group members (not just managers)
CREATE OR REPLACE FUNCTION public.create_group_member_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  actor_name TEXT;
  group_name TEXT;
  notification_title TEXT;
  log_id TEXT;
  notification_count INTEGER := 0;
BEGIN
  log_id := 'GROUP_MEMBER_NOTIF_' || substr(md5(random()::text), 1, 8);
  
  RAISE LOG '[NOTIFICATION_DEBUG] [%] ✅ GROUP_MEMBER_NOTIFICATION trigger fired for user: % joining group: %', 
    log_id, NEW.user_id, NEW.group_id;
  
  -- Get actor name and group name
  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
  FROM profiles p WHERE p.id = NEW.user_id;
  
  SELECT name INTO group_name
  FROM groups WHERE id = NEW.group_id;
  
  notification_title := actor_name || ' joined ' || group_name;
  
  RAISE LOG '[NOTIFICATION_DEBUG] [%] Creating notifications for ALL group members with title: "%"', 
    log_id, notification_title;
  
  -- Notify ALL group members (not just managers)
  INSERT INTO notifications (
    user_id,
    actor_id,
    title,
    content_type,
    content_id,
    notification_type,
    action_type,
    action_label,
    relevance_score,
    metadata
  )
  SELECT 
    gm.user_id,
    NEW.user_id,
    notification_title,
    'groups',
    NEW.group_id,
    'groups'::notification_type,
    'view'::notification_action_type,
    'View Group',
    2,
    jsonb_build_object(
      'templateId', 'group_member_joined',
      'variables', jsonb_build_object(
        'actor', actor_name,
        'groupName', group_name
      ),
      'groupId', NEW.group_id
    )
  FROM group_members gm
  WHERE gm.group_id = NEW.group_id
    AND gm.user_id != NEW.user_id; -- Don't notify the person who joined
  
  GET DIAGNOSTICS notification_count = ROW_COUNT;
  
  RAISE LOG '[NOTIFICATION_DEBUG] [%] ✅ Created % notifications for ALL group members', 
    log_id, notification_count;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[NOTIFICATION_DEBUG] [%] ❌ Error creating group member notifications: %', 
      log_id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- 2. Remove group activities from neighborhood feed by updating triggers
-- Update group member activity trigger to NOT create neighborhood activities
DROP TRIGGER IF EXISTS create_group_member_activity_trigger ON group_members;

-- Update group update activity trigger to NOT create neighborhood activities  
DROP TRIGGER IF EXISTS create_group_update_activity_trigger ON group_updates;

-- 3. Remove safety update triggers since safety page is no longer used
DROP TRIGGER IF EXISTS create_safety_update_activity_trigger ON safety_updates;
DROP TRIGGER IF EXISTS create_selective_safety_notification_trigger ON safety_updates;
DROP TRIGGER IF EXISTS create_templated_safety_comment_notification_trigger ON safety_update_comments;

-- 4. Add group update comment notification system
CREATE OR REPLACE FUNCTION public.create_group_update_comment_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  actor_name TEXT;
  update_title TEXT;
  update_author_id UUID;
  group_name TEXT;
  notification_title TEXT;
  log_id TEXT;
BEGIN
  log_id := 'GROUP_COMMENT_NOTIF_' || substr(md5(random()::text), 1, 8);
  
  RAISE LOG '[NOTIFICATION_DEBUG] [%] Starting group update comment notification for comment: %', 
    log_id, NEW.id;
  
  -- Get comment author name
  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
  FROM profiles p WHERE p.id = NEW.user_id;
  
  -- Get update details
  SELECT gu.title, gu.user_id, g.name 
  INTO update_title, update_author_id, group_name
  FROM group_updates gu
  JOIN groups g ON g.id = gu.group_id
  WHERE gu.id = NEW.update_id;
  
  notification_title := actor_name || ' commented on "' || update_title || '" in ' || group_name;
  
  -- 1. Notify the original update author (if they didn't write the comment)
  IF NEW.user_id != update_author_id THEN
    PERFORM create_unified_system_notification(
      update_author_id,
      NEW.user_id,
      notification_title,
      'group_update_comments',
      NEW.id,
      'groups'::notification_type,
      'view'::notification_action_type,
      'View Comment',
      3,
      jsonb_build_object(
        'templateId', 'group_update_comment',
        'variables', jsonb_build_object(
          'actor', actor_name,
          'updateTitle', update_title,
          'groupName', group_name
        ),
        'updateId', NEW.update_id,
        'commentId', NEW.id,
        'groupId', (SELECT group_id FROM group_updates WHERE id = NEW.update_id)
      )
    );
    
    RAISE LOG '[NOTIFICATION_DEBUG] [%] Notified update author: %', log_id, update_author_id;
  END IF;
  
  -- 2. Notify other commenters on this update (exclude comment author and update author)
  PERFORM create_unified_system_notification(
    guc.user_id,
    NEW.user_id,
    notification_title,
    'group_update_comments',
    NEW.id,
    'groups'::notification_type,
    'view'::notification_action_type,
    'View Comment',
    2,
    jsonb_build_object(
      'templateId', 'group_update_comment',
      'variables', jsonb_build_object(
        'actor', actor_name,
        'updateTitle', update_title,
        'groupName', group_name
      ),
      'updateId', NEW.update_id,
      'commentId', NEW.id,
      'groupId', (SELECT group_id FROM group_updates WHERE id = NEW.update_id)
    )
  )
  FROM group_update_comments guc
  WHERE guc.update_id = NEW.update_id 
    AND guc.user_id != NEW.user_id -- Don't notify the comment author
    AND guc.user_id != update_author_id -- Don't double-notify the update author
    AND guc.id != NEW.id -- Don't include the new comment itself
  GROUP BY guc.user_id; -- Ensure unique notifications per user
  
  RAISE LOG '[NOTIFICATION_DEBUG] [%] Group update comment notifications created successfully', log_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[NOTIFICATION_DEBUG] [%] Error creating group update comment notifications: %', 
      log_id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Create trigger for group update comment notifications
CREATE TRIGGER create_group_update_comment_notification_trigger
  AFTER INSERT ON group_update_comments
  FOR EACH ROW
  EXECUTE FUNCTION create_group_update_comment_notification();

-- 5. Add missing activity types to enum
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'skill_update_created';
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'care_offered';
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'care_requested';