-- Fix search path security warnings for existing functions only
-- This migration adds SET search_path = 'public' to functions that actually exist in the codebase

-- Function 1: create_simple_skill_notification
CREATE OR REPLACE FUNCTION public.create_simple_skill_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  skill_title TEXT;
  requester_name TEXT;
  log_id TEXT;
BEGIN
  -- Generate a log ID for tracing
  log_id := 'SKILL_SIMPLE_' || substr(md5(random()::text), 1, 8);
  
  -- Only create notifications for skill requests (not offers)
  IF NEW.request_type != 'need' THEN
    RETURN NEW;
  END IF;
  
  -- Log the start of function execution
  RAISE LOG '[create_simple_skill_notification] [%] Processing new skill request: %', 
    log_id, NEW.id;
    
  -- Get skill title and requester info
  skill_title := NEW.title;
  
  -- Get requester profile info
  SELECT display_name INTO requester_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Set default requester name if none found
  IF requester_name IS NULL THEN
    requester_name := 'A neighbor';
  END IF;
  
  -- Notify all neighbors who have offered similar skills in the same neighborhood
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
    se_offers.user_id,
    NEW.user_id,
    requester_name || ' is looking for help with: ' || skill_title,
    'skills',
    NEW.id,
    'skills',
    'contact',
    'Share Contact Info',
    3, -- High relevance: direct match
    jsonb_build_object(
      'skillId', NEW.id,
      'requesterId', NEW.user_id,
      'skillTitle', skill_title,
      'neighborName', requester_name,
      'contextType', 'skill_request_match',
      'actionRequired', true
    )
  FROM skills_exchange se_offers
  WHERE se_offers.skill_category = NEW.skill_category
    AND se_offers.request_type = 'offer'
    AND se_offers.neighborhood_id = NEW.neighborhood_id
    AND se_offers.user_id != NEW.user_id  -- Don't notify the requester
    AND se_offers.is_archived = false; -- Only notify for active skills
  
  RAISE LOG '[create_simple_skill_notification] [%] Notifications created for skill request', log_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_simple_skill_notification] [%] Error creating notification: %', log_id, SQLERRM;
    RETURN NEW; -- Return NEW even on error to prevent transaction failure
END;
$function$;

-- Function 2: create_targeted_skill_notification
CREATE OR REPLACE FUNCTION public.create_targeted_skill_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  skill_title TEXT;
  requester_name TEXT;
  log_id TEXT;
BEGIN
  -- Generate a log ID for tracing
  log_id := 'SKILL_TARGETED_' || substr(md5(random()::text), 1, 8);
  
  -- Only create notifications for skill requests (not offers)
  IF NEW.request_type != 'need' THEN
    RETURN NEW;
  END IF;
  
  -- Log the start of function execution
  RAISE LOG '[create_targeted_skill_notification] [%] Processing new skill request: %', 
    log_id, NEW.id;
    
  -- Get skill title and requester info
  skill_title := NEW.title;
  
  -- Get requester profile info
  SELECT display_name INTO requester_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Set default requester name if none found
  IF requester_name IS NULL THEN
    requester_name := 'A neighbor';
  END IF;
  
  -- Only notify neighbors who have offered the EXACT same skill category
  -- This is more targeted than the previous broad approach
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
    se_offers.user_id,
    NEW.user_id,
    requester_name || ' is looking for help with: ' || skill_title,
    'skills',
    NEW.id,
    'skills',
    'contact',
    'Share Contact Info',
    3, -- High relevance: direct match
    jsonb_build_object(
      'skillId', NEW.id,
      'requesterId', NEW.user_id,
      'skillTitle', skill_title,
      'neighborName', requester_name,
      'contextType', 'skill_request_match',
      'actionRequired', true
    )
  FROM skills_exchange se_offers
  WHERE se_offers.skill_category = NEW.skill_category
    AND se_offers.request_type = 'offer'
    AND se_offers.neighborhood_id = NEW.neighborhood_id
    AND se_offers.user_id != NEW.user_id  -- Don't notify the requester
    AND se_offers.is_archived = false; -- Only notify for active skills
  
  RAISE LOG '[create_targeted_skill_notification] [%] Targeted skill notifications created', log_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_targeted_skill_notification] [%] Error creating notification: %', log_id, SQLERRM;
    RETURN NEW; -- Return NEW even on error to prevent transaction failure
END;
$function$;

-- Function 3: delete_user_account
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  deletion_log jsonb := '{}';
  affected_rows integer;
BEGIN
  -- Only allow users to delete their own account
  IF auth.uid() != target_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Can only delete your own account'
    );
  END IF;

  -- Start deletion process - order matters due to foreign key constraints
  
  -- Delete notifications (both sent and received)
  DELETE FROM notifications WHERE user_id = target_user_id OR actor_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{notifications}', to_jsonb(affected_rows));

  -- Delete activity records
  DELETE FROM activities WHERE actor_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{activities}', to_jsonb(affected_rows));

  -- Delete RSVP records
  DELETE FROM event_rsvps WHERE user_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{event_rsvps}', to_jsonb(affected_rows));

  -- Delete safety update comments
  DELETE FROM safety_update_comments WHERE user_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{safety_comments}', to_jsonb(affected_rows));

  -- Delete skill contributors
  DELETE FROM skill_contributors WHERE user_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{skill_contributors}', to_jsonb(affected_rows));

  -- DELETE SHARED ITEMS (PREVIOUSLY MISSING)
  DELETE FROM shared_items WHERE shared_by = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{shared_items}', to_jsonb(affected_rows));

  -- Delete user's content
  DELETE FROM events WHERE host_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{events}', to_jsonb(affected_rows));

  DELETE FROM safety_updates WHERE author_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{safety_updates}', to_jsonb(affected_rows));

  DELETE FROM skills_exchange WHERE user_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{skills_exchange}', to_jsonb(affected_rows));

  DELETE FROM goods_exchange WHERE user_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{goods_exchange}', to_jsonb(affected_rows));

  DELETE FROM care_requests WHERE user_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{care_requests}', to_jsonb(affected_rows));

  DELETE FROM support_requests WHERE user_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{support_requests}', to_jsonb(affected_rows));

  -- Delete invitations sent by user
  DELETE FROM invitations WHERE inviter_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{sent_invitations}', to_jsonb(affected_rows));

  -- Delete invitations accepted by user
  DELETE FROM invitations WHERE accepted_by_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{accepted_invitations}', to_jsonb(affected_rows));

  -- Remove from neighborhood memberships
  DELETE FROM neighborhood_members WHERE user_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{neighborhood_memberships}', to_jsonb(affected_rows));

  -- Delete neighborhoods created by user (this will cascade delete related data)
  DELETE FROM neighborhoods WHERE created_by = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{created_neighborhoods}', to_jsonb(affected_rows));

  -- Delete user roles
  DELETE FROM user_roles WHERE user_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{user_roles}', to_jsonb(affected_rows));

  -- Delete user profile (but NOT auth.users - that allows re-registration)
  DELETE FROM profiles WHERE id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{profile}', to_jsonb(affected_rows));

  -- Log the deletion for audit purposes
  RAISE LOG 'User account deleted: % - Deletion log: %', target_user_id, deletion_log;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Account and all associated data deleted successfully. You can sign up again with the same email if desired.',
    'deletion_log', deletion_log
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error deleting user account %: %', target_user_id, SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$function$;

-- Function 4: verify_user_deletion
CREATE OR REPLACE FUNCTION public.verify_user_deletion(target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  remaining_data jsonb := '{}';
  count_result integer;
BEGIN
  -- Only allow checking deletion of one's own account or by admins
  IF auth.uid() != target_user_id AND NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin')
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Can only verify your own account deletion'
    );
  END IF;

  -- Check each table for remaining data
  SELECT COUNT(*) INTO count_result FROM notifications WHERE user_id = target_user_id OR actor_id = target_user_id;
  remaining_data := jsonb_set(remaining_data, '{notifications}', to_jsonb(count_result));

  SELECT COUNT(*) INTO count_result FROM activities WHERE actor_id = target_user_id;
  remaining_data := jsonb_set(remaining_data, '{activities}', to_jsonb(count_result));

  SELECT COUNT(*) INTO count_result FROM event_rsvps WHERE user_id = target_user_id;
  remaining_data := jsonb_set(remaining_data, '{event_rsvps}', to_jsonb(count_result));

  SELECT COUNT(*) INTO count_result FROM safety_update_comments WHERE user_id = target_user_id;
  remaining_data := jsonb_set(remaining_data, '{safety_comments}', to_jsonb(count_result));

  SELECT COUNT(*) INTO count_result FROM skill_contributors WHERE user_id = target_user_id;
  remaining_data := jsonb_set(remaining_data, '{skill_contributors}', to_jsonb(count_result));

  SELECT COUNT(*) INTO count_result FROM shared_items WHERE shared_by = target_user_id;
  remaining_data := jsonb_set(remaining_data, '{shared_items}', to_jsonb(count_result));

  SELECT COUNT(*) INTO count_result FROM events WHERE host_id = target_user_id;
  remaining_data := jsonb_set(remaining_data, '{events}', to_jsonb(count_result));

  SELECT COUNT(*) INTO count_result FROM safety_updates WHERE author_id = target_user_id;
  remaining_data := jsonb_set(remaining_data, '{safety_updates}', to_jsonb(count_result));

  SELECT COUNT(*) INTO count_result FROM skills_exchange WHERE user_id = target_user_id;
  remaining_data := jsonb_set(remaining_data, '{skills_exchange}', to_jsonb(count_result));

  SELECT COUNT(*) INTO count_result FROM goods_exchange WHERE user_id = target_user_id;
  remaining_data := jsonb_set(remaining_data, '{goods_exchange}', to_jsonb(count_result));

  SELECT COUNT(*) INTO count_result FROM care_requests WHERE user_id = target_user_id;
  remaining_data := jsonb_set(remaining_data, '{care_requests}', to_jsonb(count_result));

  SELECT COUNT(*) INTO count_result FROM support_requests WHERE user_id = target_user_id;
  remaining_data := jsonb_set(remaining_data, '{support_requests}', to_jsonb(count_result));

  SELECT COUNT(*) INTO count_result FROM invitations WHERE inviter_id = target_user_id OR accepted_by_id = target_user_id;
  remaining_data := jsonb_set(remaining_data, '{invitations}', to_jsonb(count_result));

  SELECT COUNT(*) INTO count_result FROM neighborhood_members WHERE user_id = target_user_id;
  remaining_data := jsonb_set(remaining_data, '{neighborhood_memberships}', to_jsonb(count_result));

  SELECT COUNT(*) INTO count_result FROM neighborhoods WHERE created_by = target_user_id;
  remaining_data := jsonb_set(remaining_data, '{created_neighborhoods}', to_jsonb(count_result));

  SELECT COUNT(*) INTO count_result FROM user_roles WHERE user_id = target_user_id;
  remaining_data := jsonb_set(remaining_data, '{user_roles}', to_jsonb(count_result));

  SELECT COUNT(*) INTO count_result FROM profiles WHERE id = target_user_id;
  remaining_data := jsonb_set(remaining_data, '{profile}', to_jsonb(count_result));

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Deletion verification complete',
    'remaining_data', remaining_data,
    'completely_deleted', (
      -- Check if all counts are zero
      (remaining_data->>'notifications')::int = 0 AND
      (remaining_data->>'activities')::int = 0 AND
      (remaining_data->>'event_rsvps')::int = 0 AND
      (remaining_data->>'safety_comments')::int = 0 AND
      (remaining_data->>'skill_contributors')::int = 0 AND
      (remaining_data->>'shared_items')::int = 0 AND
      (remaining_data->>'events')::int = 0 AND
      (remaining_data->>'safety_updates')::int = 0 AND
      (remaining_data->>'skills_exchange')::int = 0 AND
      (remaining_data->>'goods_exchange')::int = 0 AND
      (remaining_data->>'care_requests')::int = 0 AND
      (remaining_data->>'support_requests')::int = 0 AND
      (remaining_data->>'invitations')::int = 0 AND
      (remaining_data->>'neighborhood_memberships')::int = 0 AND
      (remaining_data->>'created_neighborhoods')::int = 0 AND
      (remaining_data->>'user_roles')::int = 0 AND
      (remaining_data->>'profile')::int = 0
    )
  );
END;
$function$;

-- Function 5: create_profile_update_notification
CREATE OR REPLACE FUNCTION public.create_profile_update_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  user_display_name TEXT;
  user_neighborhood_id UUID;
  log_id TEXT;
  significant_change BOOLEAN := FALSE;
  changed_fields TEXT[] := '{}';
BEGIN
  -- Generate a transaction ID for logging
  log_id := 'PROFILE_UPDATE_' || substr(md5(random()::text), 1, 8);
  
  -- Log the start of function execution
  RAISE LOG '[create_profile_update_notification] [%] Starting execution for user: %', 
    log_id, NEW.id;

  -- Check if significant fields were updated (only create notifications for meaningful changes)
  IF OLD.display_name IS DISTINCT FROM NEW.display_name THEN
    significant_change := TRUE;
    changed_fields := array_append(changed_fields, 'display_name');
  END IF;
  
  IF OLD.avatar_url IS DISTINCT FROM NEW.avatar_url THEN
    significant_change := TRUE;
    changed_fields := array_append(changed_fields, 'avatar_url');
  END IF;
  
  IF OLD.bio IS DISTINCT FROM NEW.bio THEN
    significant_change := TRUE;
    changed_fields := array_append(changed_fields, 'bio');
  END IF;
  
  IF OLD.skills IS DISTINCT FROM NEW.skills THEN
    significant_change := TRUE;
    changed_fields := array_append(changed_fields, 'skills');
  END IF;
  
  -- If no significant changes, exit early
  IF NOT significant_change THEN
    RETURN NEW;
  END IF;
  
  -- Get user's display name
  user_display_name := NEW.display_name;
  IF user_display_name IS NULL THEN
    user_display_name := 'A neighbor';
  END IF;
  
  -- Find user's neighborhood
  SELECT neighborhood_id INTO user_neighborhood_id
  FROM neighborhood_members
  WHERE user_id = NEW.id
  AND status = 'active'
  LIMIT 1;
  
  -- If no neighborhood found, check if they created one
  IF user_neighborhood_id IS NULL THEN
    SELECT id INTO user_neighborhood_id
    FROM neighborhoods
    WHERE created_by = NEW.id
    LIMIT 1;
  END IF;
  
  -- If we found a neighborhood, create an activity
  IF user_neighborhood_id IS NOT NULL THEN
    -- Create activity for the neighborhood feed
    INSERT INTO activities (
      actor_id,
      activity_type,
      content_id,
      content_type,
      title,
      neighborhood_id,
      metadata
    ) VALUES (
      NEW.id,
      'profile_updated',
      NEW.id,
      'neighbors',
      user_display_name || ' updated their profile',
      user_neighborhood_id,
      jsonb_build_object(
        'neighborName', user_display_name,
        'updatedFields', changed_fields,
        'action', 'update'
      )
    );
    
    -- For profile updates, we don't create direct notifications to all neighbors
    -- as it would be too spammy. We just create the activity so it shows in the feed.
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_profile_update_notification] [%] Error: %', log_id, SQLERRM;
    RETURN NEW; -- Return NEW even on error to prevent transaction failure
END;
$function$;

-- Function 6: create_activity
CREATE OR REPLACE FUNCTION public.create_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    activity_type_val activity_type;
    content_id_val uuid;
    title_val text;
    metadata_val jsonb := '{}';
    actor_id_val uuid;
    session_id text;
BEGIN
    -- Generate a unique session ID for logging
    session_id := 'ACT_' || substr(md5(random()::text), 1, 8);
    
    RAISE LOG '[create_activity] [%] Starting execution for table % and row id %', 
        session_id, TG_TABLE_NAME, NEW.id;

    -- Set content_id to the row's ID
    content_id_val := NEW.id;
    
    -- Handle different table types and their specific user ID field names
    CASE TG_TABLE_NAME
        WHEN 'events' THEN
            activity_type_val := 'event_created';
            title_val := NEW.title;
            actor_id_val := NEW.host_id;  -- Events use host_id, not user_id
            
        WHEN 'safety_updates' THEN
            activity_type_val := 'safety_update';
            title_val := NEW.title;
            actor_id_val := NEW.author_id;  -- Safety updates use author_id
            metadata_val := jsonb_build_object('type', NEW.type);
            
        WHEN 'skills_exchange' THEN
            IF NEW.request_type = 'offer' THEN
                activity_type_val := 'skill_offered';
            ELSE
                activity_type_val := 'skill_requested';
            END IF;
            title_val := NEW.title;
            actor_id_val := NEW.user_id;  -- Skills use user_id
            metadata_val := jsonb_build_object(
                'category', NEW.skill_category,
                'request_type', NEW.request_type
            );
            
        WHEN 'goods_exchange' THEN
            IF NEW.request_type = 'offer' THEN
                activity_type_val := 'good_shared';
            ELSE
                activity_type_val := 'good_requested';
            END IF;
            title_val := NEW.title;
            actor_id_val := NEW.user_id;  -- Goods use user_id
            metadata_val := jsonb_build_object(
                'goods_category', NEW.goods_category,
                'request_type', NEW.request_type,
                'urgency', NEW.urgency
            );
            
        ELSE
            RAISE LOG '[create_activity] [%] Unsupported table: %', session_id, TG_TABLE_NAME;
            RETURN NEW;
    END CASE;

    -- Insert the activity record
    INSERT INTO activities (
        actor_id,
        activity_type,
        content_id,
        content_type,
        title,
        neighborhood_id,
        metadata,
        created_at
    ) VALUES (
        actor_id_val,
        activity_type_val,
        content_id_val,
        TG_TABLE_NAME,
        title_val,
        NEW.neighborhood_id,
        metadata_val,
        now()
    );

    RAISE LOG '[create_activity] [%] Activity created successfully for % with type %', 
        session_id, TG_TABLE_NAME, activity_type_val;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG '[create_activity] [%] Error in create_activity: %', session_id, SQLERRM;
        -- Don't fail the original operation, just log the error
        RETURN NEW;
END;
$function$;

-- Function 7: assign_neighborhood_admin_role
CREATE OR REPLACE FUNCTION public.assign_neighborhood_admin_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Assign admin role to the neighborhood creator
  INSERT INTO neighborhood_roles (user_id, neighborhood_id, role, assigned_by)
  VALUES (NEW.created_by, NEW.id, 'admin', NEW.created_by);
  
  RETURN NEW;
END;
$function$;

-- Function 8: update_neighborhood_roles_updated_at
CREATE OR REPLACE FUNCTION public.update_neighborhood_roles_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Function 9: notify_skill_completion
CREATE OR REPLACE FUNCTION public.notify_skill_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  skill_title TEXT;
  provider_name TEXT;
  requester_name TEXT;
  log_id TEXT;
BEGIN
  -- Generate a log ID for tracing
  log_id := 'SKILL_COMPLETE_' || substr(md5(random()::text), 1, 8);
  
  -- Only proceed if status changed to 'completed'
  IF NOT (NEW.status = 'completed' AND OLD.status != 'completed') THEN
    RETURN NEW;
  END IF;
  
  -- Log the start of function execution
  RAISE LOG '[notify_skill_completion] [%] Processing skill completion for session: %', 
    log_id, NEW.id;
    
  -- Get skill title
  SELECT title INTO skill_title
  FROM skills_exchange
  WHERE id = NEW.skill_id;
  
  -- Get provider and requester names
  SELECT display_name INTO provider_name
  FROM profiles
  WHERE id = NEW.provider_id;
  
  SELECT display_name INTO requester_name
  FROM profiles
  WHERE id = NEW.requester_id;
  
  -- Set defaults if names not found
  provider_name := COALESCE(provider_name, 'A neighbor');
  requester_name := COALESCE(requester_name, 'A neighbor');
  
  -- Create notifications for both parties about completion
  -- Notification for provider
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
    NEW.provider_id,
    NEW.requester_id,
    'Skill session completed: ' || COALESCE(skill_title, 'Skill sharing'),
    'skill_sessions',
    NEW.id,
    'skills',
    'schedule',
    'View Session',
    2, -- Medium priority: completion notification
    jsonb_build_object(
      'skillId', NEW.skill_id,
      'sessionId', NEW.id,
      'skillTitle', skill_title,
      'neighborName', requester_name,
      'contextType', 'skill_completion'
    )
  );
  
  -- Notification for requester
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
    NEW.requester_id,
    NEW.provider_id,
    'Skill session completed: ' || COALESCE(skill_title, 'Skill sharing'),
    'skill_sessions',
    NEW.id,
    'skills',
    'schedule',
    'View Session',
    2, -- Medium priority: completion notification
    jsonb_build_object(
      'skillId', NEW.skill_id,
      'sessionId', NEW.id,
      'skillTitle', skill_title,
      'neighborName', provider_name,
      'contextType', 'skill_completion'
    )
  );
  
  RAISE LOG '[notify_skill_completion] [%] Completion notifications created successfully', log_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[notify_skill_completion] [%] Error creating notifications: %', log_id, SQLERRM;
    RETURN NEW; -- Return NEW even on error to prevent transaction failure
END;
$function$;