-- Add email queueing to all notification triggers
-- This enables email notifications for group updates, comments, members, neighbors, and events

-- Helper function to queue email notifications
CREATE OR REPLACE FUNCTION queue_notification_email(
  p_user_id UUID,
  p_notification_type TEXT,
  p_template_data JSONB,
  p_neighborhood_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Check if user should receive this email
  IF NOT should_user_receive_email_notification(p_user_id, p_notification_type, '') THEN
    RETURN;
  END IF;

  -- Get user email
  SELECT au.email INTO user_email
  FROM auth.users au
  WHERE au.id = p_user_id;

  IF user_email IS NULL THEN
    RETURN;
  END IF;

  -- Queue the email
  INSERT INTO email_queue (
    user_id,
    recipient_email,
    template_type,
    template_data,
    neighborhood_id
  ) VALUES (
    p_user_id,
    user_email,
    p_notification_type || '-notification',
    p_template_data,
    p_neighborhood_id
  );
END;
$$;

-- Update group_update_posted notification to include email
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
  neighborhood_id_var UUID;
  member_record RECORD;
BEGIN
  log_id := 'GROUP_UPDATE_NOTIF_' || substr(md5(random()::text), 1, 8);

  RAISE LOG '[create_group_update_notification] [%] Starting execution for group update: %', log_id, NEW.id;

  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
  FROM profiles p WHERE p.id = NEW.user_id;

  SELECT name, neighborhood_id INTO group_name, neighborhood_id_var
  FROM groups WHERE id = NEW.group_id;

  notification_title := actor_name || ' posted in ' || group_name || ': ' || NEW.title;

  -- Notify all group members except the author
  FOR member_record IN
    SELECT gm.user_id
    FROM group_members gm
    WHERE gm.group_id = NEW.group_id
      AND gm.user_id != NEW.user_id
  LOOP
    -- Create in-app notification
    PERFORM create_unified_system_notification(
      member_record.user_id,
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
    );

    -- Queue email notification
    PERFORM queue_notification_email(
      member_record.user_id,
      'group_update_posted',
      jsonb_build_object(
        'actor', actor_name,
        'groupName', group_name,
        'updateTitle', NEW.title,
        'updateId', NEW.id
      ),
      neighborhood_id_var
    );
  END LOOP;

  RAISE LOG '[create_group_update_notification] [%] Notifications created successfully', log_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_group_update_notification] [%] Error: %', log_id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Update group_member_joined notification to include email
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
  neighborhood_id_var UUID;
  notification_count INTEGER := 0;
BEGIN
  log_id := 'GROUP_MEMBER_NOTIF_' || substr(md5(random()::text), 1, 8);

  RAISE LOG '[create_group_member_notification] [%] GROUP_MEMBER_NOTIFICATION trigger fired for user: % joining group: %',
    log_id, NEW.user_id, NEW.group_id;

  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
  FROM profiles p WHERE p.id = NEW.user_id;

  SELECT name, neighborhood_id INTO group_name, neighborhood_id_var
  FROM groups WHERE id = NEW.group_id;

  notification_title := actor_name || ' joined ' || group_name;

  RAISE LOG '[create_group_member_notification] [%] Creating notifications for ALL group members with title: "%"',
    log_id, notification_title;

  -- Notify ALL group members (not just managers) and queue emails
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
    AND gm.user_id != NEW.user_id;

  GET DIAGNOSTICS notification_count = ROW_COUNT;

  -- Queue emails for each member
  PERFORM queue_notification_email(
    gm.user_id,
    'group_member_joined',
    jsonb_build_object(
      'actor', actor_name,
      'groupName', group_name
    ),
    neighborhood_id_var
  )
  FROM group_members gm
  WHERE gm.group_id = NEW.group_id
    AND gm.user_id != NEW.user_id;

  RAISE LOG '[create_group_member_notification] [%] Created % notifications for ALL group members',
    log_id, notification_count;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_group_member_notification] [%] Error creating group member notifications: %',
      log_id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Update group_update_comment notification to include email
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
  neighborhood_id_var UUID;
BEGIN
  log_id := 'GROUP_COMMENT_NOTIF_' || substr(md5(random()::text), 1, 8);

  RAISE LOG '[create_group_update_comment_notification] [%] Starting group update comment notification for comment: %',
    log_id, NEW.id;

  SELECT COALESCE(p.display_name, 'A neighbor') INTO actor_name
  FROM profiles p WHERE p.id = NEW.user_id;

  SELECT gu.title, gu.user_id, g.name, g.neighborhood_id
  INTO update_title, update_author_id, group_name, neighborhood_id_var
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

    -- Queue email for update author
    PERFORM queue_notification_email(
      update_author_id,
      'group_update_comment',
      jsonb_build_object(
        'actor', actor_name,
        'updateTitle', update_title,
        'groupName', group_name,
        'commentId', NEW.id
      ),
      neighborhood_id_var
    );

    RAISE LOG '[create_group_update_comment_notification] [%] Notified update author: %', log_id, update_author_id;
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
    AND guc.user_id != NEW.user_id
    AND guc.user_id != update_author_id
    AND guc.id != NEW.id
  GROUP BY guc.user_id;

  -- Queue emails for other commenters
  PERFORM queue_notification_email(
    guc.user_id,
    'group_update_comment',
    jsonb_build_object(
      'actor', actor_name,
      'updateTitle', update_title,
      'groupName', group_name,
      'commentId', NEW.id
    ),
    neighborhood_id_var
  )
  FROM group_update_comments guc
  WHERE guc.update_id = NEW.update_id
    AND guc.user_id != NEW.user_id
    AND guc.user_id != update_author_id
    AND guc.id != NEW.id
  GROUP BY guc.user_id;

  RAISE LOG '[create_group_update_comment_notification] [%] Group update comment notifications created successfully', log_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_group_update_comment_notification] [%] Error creating group update comment notifications: %',
      log_id, SQLERRM;
    RETURN NEW;
END;
$function$;
