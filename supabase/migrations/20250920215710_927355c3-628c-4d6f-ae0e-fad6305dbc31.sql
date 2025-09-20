-- Enhanced logging for group update notification debugging (fixed syntax)
CREATE OR REPLACE FUNCTION public.create_group_update_notification()
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
  group_member_count INTEGER := 0;
  recipient_user_id UUID;
  recipient_name TEXT;
BEGIN
  log_id := 'GROUP_UPDATE_NOTIF_' || substr(md5(random()::text), 1, 8);
  
  RAISE LOG '[DEBUG_GROUP_NOTIF] [%] ✅ GROUP UPDATE NOTIFICATION trigger fired for update: % by user: % in group: %', 
    log_id, NEW.id, NEW.user_id, NEW.group_id;
  
  -- Get actor name and group name with logging
  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
  FROM profiles p WHERE p.id = NEW.user_id;
  
  RAISE LOG '[DEBUG_GROUP_NOTIF] [%] Actor name retrieved: %', log_id, actor_name;
  
  SELECT name INTO group_name
  FROM groups WHERE id = NEW.group_id;
  
  RAISE LOG '[DEBUG_GROUP_NOTIF] [%] Group name retrieved: %', log_id, group_name;
  
  -- Count group members for debugging
  SELECT COUNT(*) INTO group_member_count
  FROM group_members gm
  WHERE gm.group_id = NEW.group_id;
  
  RAISE LOG '[DEBUG_GROUP_NOTIF] [%] Total group members: %', log_id, group_member_count;
  
  notification_title := actor_name || ' posted in ' || group_name || ': ' || NEW.title;
  
  RAISE LOG '[DEBUG_GROUP_NOTIF] [%] Notification title: "%"', log_id, notification_title;
  
  -- Create notifications with detailed logging
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
    'group_updates',
    NEW.id,
    'groups'::notification_type,
    'view'::notification_action_type,
    'View Update',
    2,
    jsonb_build_object(
      'templateId', 'group_update_posted',
      'variables', jsonb_build_object(
        'actor', actor_name,
        'groupName', group_name,
        'updateTitle', NEW.title
      ),
      'groupId', NEW.group_id,
      'updateId', NEW.id
    )
  FROM group_members gm
  WHERE gm.group_id = NEW.group_id
    AND gm.user_id != NEW.user_id;
  
  GET DIAGNOSTICS notification_count = ROW_COUNT;
  
  RAISE LOG '[DEBUG_GROUP_NOTIF] [%] ✅ Created % notifications for group update', log_id, notification_count;
  
  -- Log each recipient for debugging
  FOR recipient_user_id, recipient_name IN 
    SELECT gm.user_id, COALESCE(p.display_name, 'Unknown')
    FROM group_members gm 
    LEFT JOIN profiles p ON p.id = gm.user_id
    WHERE gm.group_id = NEW.group_id AND gm.user_id != NEW.user_id
  LOOP
    RAISE LOG '[DEBUG_GROUP_NOTIF] [%] Notification created for user: % (name: %)', 
      log_id, recipient_user_id, recipient_name;
  END LOOP;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[DEBUG_GROUP_NOTIF] [%] ❌ ERROR creating group update notifications: %', 
      log_id, SQLERRM;
    RETURN NEW;
END;
$function$;