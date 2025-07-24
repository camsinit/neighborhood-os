-- SECURITY FIX: Phase 2 - Fix all remaining search_path vulnerabilities
-- Add proper search_path settings to all functions missing them

-- Fix all remaining database functions with proper search_path
CREATE OR REPLACE FUNCTION public.update_debug_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_neighborhood_from_invite(invite_code_param text)
RETURNS TABLE(neighborhood_id uuid, neighborhood_name text, neighborhood_city text, neighborhood_state text, neighborhood_created_at timestamp with time zone, member_count bigint, invitation_status text, inviter_id uuid, inviter_display_name text, inviter_avatar_url text, invite_header_image_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id as neighborhood_id, 
    n.name as neighborhood_name, 
    n.city as neighborhood_city, 
    n.state as neighborhood_state,
    n.created_at as neighborhood_created_at, 
    COALESCE(member_counts.count, 0) as member_count, 
    i.status as invitation_status,
    i.inviter_id,
    COALESCE(p.display_name, 'A neighbor') as inviter_display_name,
    p.avatar_url as inviter_avatar_url,
    n.invite_header_image_url
  FROM invitations i
  JOIN neighborhoods n ON i.neighborhood_id = n.id
  LEFT JOIN profiles p ON i.inviter_id = p.id
  LEFT JOIN (
    SELECT nm.neighborhood_id, COUNT(*) as count 
    FROM neighborhood_members nm
    WHERE nm.status = 'active' 
    GROUP BY nm.neighborhood_id
  ) member_counts ON n.id = member_counts.neighborhood_id
  WHERE i.invite_code = invite_code_param;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_neighborhood_member(user_uuid uuid, neighborhood_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.get_user_neighborhoods(user_uuid uuid)
RETURNS TABLE(id uuid, name text, joined_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT n.id, n.name, nm.joined_at
  FROM neighborhoods n
  JOIN neighborhood_members nm ON n.id = nm.neighborhood_id
  WHERE nm.user_id = user_uuid AND nm.status = 'active'
  ORDER BY n.name ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_neighborhood_user_emails(target_neighborhood_id uuid)
RETURNS TABLE(user_id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    au.email::text as email
  FROM profiles p
  JOIN auth.users au ON p.id = au.id
  WHERE p.email_visible = true
    AND p.id IN (
      SELECT nm.user_id 
      FROM neighborhood_members nm 
      WHERE nm.neighborhood_id = target_neighborhood_id 
        AND nm.status = 'active'
      UNION
      SELECT n.created_by
      FROM neighborhoods n
      WHERE n.id = target_neighborhood_id
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  deletion_log jsonb := '{}';
  affected_rows integer;
BEGIN
  IF auth.uid() != target_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Can only delete your own account'
    );
  END IF;

  DELETE FROM notifications WHERE user_id = target_user_id OR actor_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{notifications}', to_jsonb(affected_rows));

  DELETE FROM activities WHERE actor_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{activities}', to_jsonb(affected_rows));

  DELETE FROM event_rsvps WHERE user_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{event_rsvps}', to_jsonb(affected_rows));

  DELETE FROM safety_update_comments WHERE user_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{safety_comments}', to_jsonb(affected_rows));

  DELETE FROM skill_contributors WHERE user_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{skill_contributors}', to_jsonb(affected_rows));

  DELETE FROM shared_items WHERE shared_by = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{shared_items}', to_jsonb(affected_rows));

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

  DELETE FROM support_requests WHERE user_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{support_requests}', to_jsonb(affected_rows));

  DELETE FROM invitations WHERE inviter_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{sent_invitations}', to_jsonb(affected_rows));

  DELETE FROM invitations WHERE accepted_by_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{accepted_invitations}', to_jsonb(affected_rows));

  DELETE FROM neighborhood_members WHERE user_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{neighborhood_memberships}', to_jsonb(affected_rows));

  DELETE FROM neighborhoods WHERE created_by = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{created_neighborhoods}', to_jsonb(affected_rows));

  DELETE FROM user_roles WHERE user_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{user_roles}', to_jsonb(affected_rows));

  DELETE FROM profiles WHERE id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{profile}', to_jsonb(affected_rows));

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
$$;

CREATE OR REPLACE FUNCTION public.get_user_neighborhood_role(user_uuid uuid, neighborhood_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role TEXT;
BEGIN
  IF EXISTS (
    SELECT 1 FROM neighborhoods 
    WHERE id = neighborhood_uuid AND created_by = user_uuid
  ) THEN
    RETURN 'admin';
  END IF;
  
  SELECT role INTO user_role
  FROM neighborhood_roles
  WHERE user_id = user_uuid AND neighborhood_id = neighborhood_uuid;
  
  IF user_role IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM neighborhood_members
      WHERE user_id = user_uuid 
      AND neighborhood_id = neighborhood_uuid 
      AND status = 'active'
    ) THEN
      RETURN 'neighbor';
    END IF;
  END IF;
  
  RETURN COALESCE(user_role, 'neighbor');
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_neighborhood_ids(user_uuid uuid)
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  neighborhood_ids uuid[];
BEGIN
  SELECT ARRAY(SELECT neighborhood_id FROM neighborhood_members WHERE user_id = user_uuid AND status = 'active') INTO neighborhood_ids;
  SELECT neighborhood_ids || ARRAY(SELECT id FROM neighborhoods WHERE created_by = user_uuid) INTO neighborhood_ids;
  SELECT ARRAY(SELECT DISTINCT unnest(neighborhood_ids)) INTO neighborhood_ids;
  RETURN neighborhood_ids;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_user_in_neighborhood(user_uuid uuid, neighborhood_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM neighborhood_members
    WHERE user_id = user_uuid AND neighborhood_id = neighborhood_uuid AND status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM neighborhoods
    WHERE id = neighborhood_uuid AND created_by = user_uuid
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_current_neighborhood(user_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  neighborhood_id UUID;
BEGIN
  SELECT id INTO neighborhood_id FROM neighborhoods WHERE created_by = user_uuid LIMIT 1;
  
  IF neighborhood_id IS NULL THEN
    SELECT nm.neighborhood_id INTO neighborhood_id
    FROM neighborhood_members nm
    WHERE nm.user_id = user_uuid AND nm.status = 'active'
    LIMIT 1;
  END IF;
  
  RETURN neighborhood_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_neighborhood_limit(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
DECLARE
  neighborhood_count INTEGER;
BEGIN
  SELECT (
    COALESCE((SELECT COUNT(*) FROM neighborhood_members WHERE user_id = user_uuid AND status = 'active'), 0) +
    COALESCE((SELECT COUNT(*) FROM neighborhoods WHERE created_by = user_uuid), 0)
  ) INTO neighborhood_count;
  
  RETURN neighborhood_count < 3;
END;
$$;