-- Security Fix Migration: Address Database Linter Warnings
-- This migration fixes function search paths, moves extensions, and updates versions

-- 1. Create dedicated schema for extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2. Move pg_net extension to extensions schema
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- 3. Update pg_graphql extension to latest version
ALTER EXTENSION pg_graphql UPDATE TO '1.5.11';

-- 4. Fix all function search paths by recreating functions with SET search_path = 'public'

-- Function: update_skill_contributors_updated_at
CREATE OR REPLACE FUNCTION public.update_skill_contributors_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$function$;

-- Function: check_user_neighborhood_count
CREATE OR REPLACE FUNCTION public.check_user_neighborhood_count(user_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT (
    CASE WHEN EXISTS (SELECT 1 FROM neighborhoods WHERE created_by = user_uuid) THEN 1 ELSE 0 END +
    CASE WHEN EXISTS (SELECT 1 FROM neighborhood_members WHERE user_id = user_uuid AND status = 'active') THEN 1 ELSE 0 END
  );
$function$;

-- Function: update_email_queue_updated_at
CREATE OR REPLACE FUNCTION public.update_email_queue_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Function: create_safety_update_activity
CREATE OR REPLACE FUNCTION public.create_safety_update_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  activity_title TEXT;
  log_id TEXT;
BEGIN
  -- Generate a transaction ID for logging
  log_id := 'SAFETY_ACTIVITY_' || substr(md5(random()::text), 1, 8);
  
  -- Log the start of function execution
  RAISE LOG '[create_safety_update_activity] [%] Starting execution for safety update: %', 
    log_id, NEW.id;

  -- Set the activity title
  activity_title := NEW.title;

  -- Create activity entry
  INSERT INTO activities (
    actor_id,
    activity_type,
    content_id,
    content_type,
    title,
    neighborhood_id,
    metadata
  ) VALUES (
    NEW.author_id,
    'safety_update',
    NEW.id,
    'safety_updates',
    activity_title,
    NEW.neighborhood_id,
    jsonb_build_object(
      'type', NEW.type,
      'description', COALESCE(NEW.description, '')
    )
  );

  RAISE LOG '[create_safety_update_activity] [%] Activity created successfully for safety update: %', 
    log_id, NEW.id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_safety_update_activity] [%] Error: %', log_id, SQLERRM;
    RETURN NEW; -- Return NEW even on error to prevent transaction failure
END;
$function$;

-- Function: prevent_multiple_neighborhoods
CREATE OR REPLACE FUNCTION public.prevent_multiple_neighborhoods()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  -- Direct check without calling other functions that might cause recursion
  IF EXISTS (
    SELECT 1 FROM neighborhood_members 
    WHERE user_id = NEW.created_by AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'User is already a member of a neighborhood and cannot create another one';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Function: prevent_multiple_memberships
CREATE OR REPLACE FUNCTION public.prevent_multiple_memberships()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  -- Direct check without calling other functions that might cause recursion
  IF EXISTS (
    SELECT 1 FROM neighborhoods 
    WHERE created_by = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'User has already created a neighborhood and cannot join another one';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Function: get_user_neighborhood_ids
CREATE OR REPLACE FUNCTION public.get_user_neighborhood_ids(user_uuid uuid)
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  neighborhood_ids uuid[];
BEGIN
  -- Get neighborhood IDs where user is a member
  SELECT ARRAY(
    SELECT neighborhood_id 
    FROM neighborhood_members 
    WHERE user_id = user_uuid AND status = 'active'
  ) INTO neighborhood_ids;
  
  -- Add neighborhoods created by the user
  SELECT neighborhood_ids || ARRAY(
    SELECT id 
    FROM neighborhoods 
    WHERE created_by = user_uuid
  ) INTO neighborhood_ids;
  
  -- Remove duplicates and return
  SELECT ARRAY(SELECT DISTINCT unnest(neighborhood_ids)) INTO neighborhood_ids;
  
  RETURN neighborhood_ids;
END;
$function$;

-- Function: generate_share_code
CREATE OR REPLACE FUNCTION public.generate_share_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  -- Generate 12-character random string
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM shared_items WHERE share_code = result) LOOP
    result := '';
    FOR i IN 1..12 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
  END LOOP;
  
  RETURN result;
END;
$function$;

-- Function: delete_activity_debug
CREATE OR REPLACE FUNCTION public.delete_activity_debug(activity_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only allow super admins to delete activities
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Only super admins can delete activities';
  END IF;
  
  -- Delete the activity
  DELETE FROM activities WHERE id = activity_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$function$;

-- Function: add_neighborhood_member
CREATE OR REPLACE FUNCTION public.add_neighborhood_member(user_uuid uuid, neighborhood_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  already_exists BOOLEAN;
BEGIN
  -- Check if the user is already a member
  SELECT EXISTS (
    SELECT 1 FROM neighborhood_members
    WHERE user_id = user_uuid
    AND neighborhood_id = neighborhood_uuid
    AND status = 'active'
  ) INTO already_exists;
  
  -- If already a member, return true without doing anything
  IF already_exists THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is under the neighborhood limit
  IF NOT public.check_neighborhood_limit(user_uuid) THEN
    RAISE EXCEPTION 'User has reached the maximum number of neighborhoods (3)';
  END IF;
  
  -- Add the user as a member
  INSERT INTO neighborhood_members (
    user_id,
    neighborhood_id,
    status,
    joined_at
  ) VALUES (
    user_uuid,
    neighborhood_uuid,
    'active',
    now()
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$function$;

-- Function: create_simple_skill_notification
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

-- Continue with remaining functions in next part due to length limits...