-- Create trigger function for group update activities
CREATE OR REPLACE FUNCTION public.create_group_update_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  actor_name TEXT;
  activity_title TEXT;
  log_id TEXT;
BEGIN
  log_id := 'GROUP_UPDATE_ACTIVITY_' || substr(md5(random()::text), 1, 8);
  
  RAISE LOG '[create_group_update_activity] [%] Starting execution for group update: %', log_id, NEW.id;
  
  -- Get the actor's display name
  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
  FROM profiles p WHERE p.id = NEW.user_id;
  
  -- Create activity title 
  activity_title := actor_name || ' posted an update: ' || NEW.title;
  
  -- Insert activity for group update creation
  INSERT INTO activities (
    actor_id,
    activity_type,
    content_id,
    content_type,
    title,
    neighborhood_id,
    metadata
  ) VALUES (
    NEW.user_id,
    'group_update_created',
    NEW.id,
    'group_updates',
    activity_title,
    (SELECT neighborhood_id FROM groups WHERE id = NEW.group_id),
    jsonb_build_object(
      'groupId', NEW.group_id,
      'updateTitle', NEW.title,
      'hasImages', (NEW.image_urls IS NOT NULL AND array_length(NEW.image_urls, 1) > 0)
    )
  );
  
  RAISE LOG '[create_group_update_activity] [%] Activity created successfully for group update: %', log_id, NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_group_update_activity] [%] Error: %', log_id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Create trigger for group update activities
CREATE TRIGGER trigger_create_group_update_activity
  AFTER INSERT ON public.group_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.create_group_update_activity();

-- Create trigger function for group update notifications
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
BEGIN
  log_id := 'GROUP_UPDATE_NOTIF_' || substr(md5(random()::text), 1, 8);
  
  RAISE LOG '[create_group_update_notification] [%] Starting execution for group update: %', log_id, NEW.id;
  
  -- Get actor name and group name
  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
  FROM profiles p WHERE p.id = NEW.user_id;
  
  SELECT name INTO group_name
  FROM groups WHERE id = NEW.group_id;
  
  notification_title := actor_name || ' posted in ' || group_name || ': ' || NEW.title;
  
  -- Notify all group members except the author
  PERFORM create_unified_system_notification(
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
  )
  FROM group_members gm
  WHERE gm.group_id = NEW.group_id
    AND gm.user_id != NEW.user_id;
  
  RAISE LOG '[create_group_update_notification] [%] Notifications created successfully', log_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_group_update_notification] [%] Error: %', log_id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Create trigger for group update notifications
CREATE TRIGGER trigger_create_group_update_notification
  AFTER INSERT ON public.group_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.create_group_update_notification();

-- Create trigger function for group member activities
CREATE OR REPLACE FUNCTION public.create_group_member_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  actor_name TEXT;
  group_name TEXT;
  activity_title TEXT;
  log_id TEXT;
BEGIN
  log_id := 'GROUP_MEMBER_ACTIVITY_' || substr(md5(random()::text), 1, 8);
  
  RAISE LOG '[create_group_member_activity] [%] Starting execution for member: %', log_id, NEW.user_id;
  
  -- Get actor name and group name
  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
  FROM profiles p WHERE p.id = NEW.user_id;
  
  SELECT name INTO group_name
  FROM groups WHERE id = NEW.group_id;
  
  activity_title := actor_name || ' joined ' || group_name;
  
  -- Insert activity for group member joining
  INSERT INTO activities (
    actor_id,
    activity_type,
    content_id,
    content_type,
    title,
    neighborhood_id,
    metadata
  ) VALUES (
    NEW.user_id,
    'group_member_joined',
    NEW.group_id,
    'groups',
    activity_title,
    (SELECT neighborhood_id FROM groups WHERE id = NEW.group_id),
    jsonb_build_object(
      'groupId', NEW.group_id,
      'groupName', group_name,
      'memberRole', NEW.role
    )
  );
  
  RAISE LOG '[create_group_member_activity] [%] Activity created successfully', log_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_group_member_activity] [%] Error: %', log_id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Create trigger for group member activities (only for non-owner joins)
CREATE TRIGGER trigger_create_group_member_activity
  AFTER INSERT ON public.group_members
  FOR EACH ROW
  WHEN (NEW.role != 'owner')
  EXECUTE FUNCTION public.create_group_member_activity();