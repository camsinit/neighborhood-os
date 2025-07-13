-- Security Fix Migration: Address Function Search Path Warnings
-- This migration fixes function search paths and moves pg_net extension

-- 1. Create dedicated schema for extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2. Move pg_net extension to extensions schema
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- 3. Fix all function search paths by recreating functions with SET search_path = 'public'
-- Note: We'll handle pg_graphql update separately as it needs incremental steps

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
  log_id := 'SAFETY_ACTIVITY_' || substr(md5(random()::text), 1, 8);
  RAISE LOG '[create_safety_update_activity] [%] Starting execution for safety update: %', log_id, NEW.id;
  activity_title := NEW.title;

  INSERT INTO activities (
    actor_id, activity_type, content_id, content_type, title, neighborhood_id, metadata
  ) VALUES (
    NEW.author_id, 'safety_update', NEW.id, 'safety_updates', activity_title, NEW.neighborhood_id,
    jsonb_build_object('type', NEW.type, 'description', COALESCE(NEW.description, ''))
  );

  RAISE LOG '[create_safety_update_activity] [%] Activity created successfully for safety update: %', log_id, NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG '[create_safety_update_activity] [%] Error: %', log_id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Function: prevent_multiple_neighborhoods
CREATE OR REPLACE FUNCTION public.prevent_multiple_neighborhoods()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  IF EXISTS (SELECT 1 FROM neighborhood_members WHERE user_id = NEW.created_by AND status = 'active') THEN
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
  IF EXISTS (SELECT 1 FROM neighborhoods WHERE created_by = NEW.user_id) THEN
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
  SELECT ARRAY(SELECT neighborhood_id FROM neighborhood_members WHERE user_id = user_uuid AND status = 'active') INTO neighborhood_ids;
  SELECT neighborhood_ids || ARRAY(SELECT id FROM neighborhoods WHERE created_by = user_uuid) INTO neighborhood_ids;
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
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  
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
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin') THEN
    RAISE EXCEPTION 'Only super admins can delete activities';
  END IF;
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
  SELECT EXISTS (SELECT 1 FROM neighborhood_members WHERE user_id = user_uuid AND neighborhood_id = neighborhood_uuid AND status = 'active') INTO already_exists;
  IF already_exists THEN RETURN TRUE; END IF;
  
  IF NOT public.check_neighborhood_limit(user_uuid) THEN
    RAISE EXCEPTION 'User has reached the maximum number of neighborhoods (3)';
  END IF;
  
  INSERT INTO neighborhood_members (user_id, neighborhood_id, status, joined_at) VALUES (user_uuid, neighborhood_uuid, 'active', now());
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$function$;