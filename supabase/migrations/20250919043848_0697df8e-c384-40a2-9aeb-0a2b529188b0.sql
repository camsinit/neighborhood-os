-- Drop and recreate the function with default parameter
DROP FUNCTION IF EXISTS public.create_unified_system_notification(uuid,uuid,text,text,uuid,notification_type,notification_action_type,text,integer,jsonb);

-- Function to create unified system notification (recreated)
CREATE OR REPLACE FUNCTION public.create_unified_system_notification(
  p_user_id uuid,
  p_actor_id uuid,
  p_title text,
  p_content_type text,
  p_content_id uuid,
  p_notification_type notification_type,
  p_action_type notification_action_type,
  p_action_label text,
  p_relevance_score integer,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
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
  ) VALUES (
    p_user_id,
    p_actor_id,
    p_title,
    p_content_type,
    p_content_id,
    p_notification_type,
    p_action_type,
    p_action_label,
    p_relevance_score,
    p_metadata
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for group notifications and activities

-- Trigger for group creation activity
CREATE OR REPLACE FUNCTION public.create_group_activity()
RETURNS TRIGGER AS $$
DECLARE
  actor_name TEXT;
  activity_title TEXT;
  log_id TEXT;
BEGIN
  log_id := 'GROUP_ACTIVITY_' || substr(md5(random()::text), 1, 8);
  
  RAISE LOG '[create_group_activity] [%] Starting execution for group: %', log_id, NEW.id;
  
  -- Get the actor's display name
  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
  FROM profiles p WHERE p.id = NEW.created_by;
  
  -- Create activity title 
  activity_title := actor_name || ' created ' || NEW.name;
  
  -- Insert activity for group creation
  INSERT INTO activities (
    actor_id,
    activity_type,
    content_id,
    content_type,
    title,
    neighborhood_id,
    metadata
  ) VALUES (
    NEW.created_by,
    'group_created',
    NEW.id,
    'groups',
    activity_title,
    NEW.neighborhood_id,
    jsonb_build_object(
      'groupName', NEW.name,
      'groupType', NEW.group_type
    )
  );
  
  RAISE LOG '[create_group_activity] [%] Activity created successfully for group: %', log_id, NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_group_activity] [%] Error: %', log_id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for group creation
DROP TRIGGER IF EXISTS create_group_activity_trigger ON groups;
CREATE TRIGGER create_group_activity_trigger
  AFTER INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION create_group_activity();

-- Trigger for group member joined notifications
CREATE OR REPLACE FUNCTION public.create_group_member_notification()
RETURNS TRIGGER AS $$
DECLARE
  actor_name TEXT;
  group_name TEXT;
  notification_title TEXT;
  log_id TEXT;
BEGIN
  log_id := 'GROUP_MEMBER_' || substr(md5(random()::text), 1, 8);
  
  RAISE LOG '[create_group_member_notification] [%] Starting execution for member: %', log_id, NEW.user_id;
  
  -- Get actor name and group name
  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
  FROM profiles p WHERE p.id = NEW.user_id;
  
  SELECT name INTO group_name
  FROM groups WHERE id = NEW.group_id;
  
  notification_title := actor_name || ' joined ' || group_name;
  
  -- Notify group managers (owners and moderators) only
  PERFORM create_unified_system_notification(
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
  )
  FROM group_members gm
  WHERE gm.group_id = NEW.group_id
    AND gm.role IN ('owner', 'moderator')
    AND gm.user_id != NEW.user_id;
  
  RAISE LOG '[create_group_member_notification] [%] Notifications created successfully', log_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_group_member_notification] [%] Error: %', log_id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for group member notifications
DROP TRIGGER IF EXISTS create_group_member_notification_trigger ON group_members;
CREATE TRIGGER create_group_member_notification_trigger
  AFTER INSERT ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION create_group_member_notification();