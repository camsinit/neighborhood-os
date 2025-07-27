-- Fix all function search path warnings by adding SET search_path TO 'public'
-- First drop and recreate functions that have signature conflicts

-- Drop the conflicting function first
DROP FUNCTION IF EXISTS public.get_all_neighborhoods_for_super_admin();

-- Now recreate all functions with proper search paths
CREATE OR REPLACE FUNCTION public.get_all_neighborhoods_for_super_admin()
RETURNS TABLE(id uuid, name text, city text, state text, address text, timezone text, created_by uuid, created_at timestamp with time zone, member_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verify the user is a super admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'::user_role
  ) THEN
    RAISE EXCEPTION 'Only super admins can access this function';
  END IF;
  
  RETURN QUERY
  SELECT 
    n.id,
    n.name,
    n.city,
    n.state,
    n.address,
    n.timezone,
    n.created_by,
    n.created_at,
    COALESCE(COUNT(nm.user_id), 0) as member_count
  FROM neighborhoods n
  LEFT JOIN neighborhood_members nm ON n.id = nm.neighborhood_id 
    AND nm.status = 'active'
  GROUP BY n.id, n.name, n.city, n.state, n.address, n.timezone, n.created_by, n.created_at
  ORDER BY n.name ASC;
END;
$function$;

-- Fix remaining functions with search path
CREATE OR REPLACE FUNCTION public.notify_skill_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- When a new skill request is created
  IF TG_OP = 'INSERT' THEN
    -- If it's a need, notify users who have offered similar skills (with preference check)
    IF NEW.request_type = 'need' THEN
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
        skills.user_id,
        NEW.user_id,
        NEW.title,
        'skill_request',
        NEW.id,
        'skills',
        'view',
        'Help Out',
        2,
        jsonb_build_object(
          'skill_category', NEW.skill_category,
          'request_type', NEW.request_type
        )
      FROM skills_exchange skills
      JOIN profiles p ON skills.user_id = p.id
      WHERE skills.request_type = 'offer'
      AND skills.skill_category = NEW.skill_category
      AND skills.user_id != NEW.user_id
      AND skills.is_archived = false
      AND (
        (p.notification_preferences->>'all_activity')::boolean = true OR 
        (p.notification_preferences->'page_specific'->>'skills')::boolean = true
      );
    
    ELSIF NEW.request_type = 'offer' THEN
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
        skills.user_id,
        NEW.user_id,
        NEW.title,
        'skill_offer',
        NEW.id,
        'skills',
        'view',
        'Learn Now',
        2,
        jsonb_build_object(
          'skill_category', NEW.skill_category,
          'request_type', NEW.request_type
        )
      FROM skills_exchange skills
      JOIN profiles p ON skills.user_id = p.id
      WHERE skills.request_type = 'need'
      AND skills.skill_category = NEW.skill_category
      AND skills.user_id != NEW.user_id
      AND skills.is_archived = false
      AND (
        (p.notification_preferences->>'all_activity')::boolean = true OR 
        (p.notification_preferences->'page_specific'->>'skills')::boolean = true
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_request_archived()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.archived_at IS NOT NULL AND OLD.archived_at IS NULL THEN
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
        VALUES (
            NEW.user_id,
            NEW.archived_by,
            CASE 
                WHEN TG_TABLE_NAME = 'care_requests' THEN 'Your care request has been fulfilled'
                ELSE 'Your item has been picked up'
            END,
            TG_TABLE_NAME,
            NEW.id,
            CASE 
                WHEN TG_TABLE_NAME = 'care_requests' THEN 'care'::notification_type
                ELSE 'goods'::notification_type
            END,
            'view',
            'View Details',
            jsonb_build_object(
                'archived_at', NEW.archived_at,
                'archived_by', NEW.archived_by
            )
        );
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_neighborhood_members(neighborhood_uuid uuid)
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  member_ids UUID[];
BEGIN
  SELECT array_agg(user_id) INTO member_ids
  FROM neighborhood_members
  WHERE neighborhood_id = neighborhood_uuid
  AND status = 'active';
  
  RETURN member_ids;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_neighborhood_members_safe(neighborhood_uuid uuid)
RETURNS SETOF uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT user_id 
  FROM neighborhood_members
  WHERE neighborhood_id = neighborhood_uuid
  AND status = 'active';
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO profiles (id)
  VALUES (new.id);
  
  INSERT INTO user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_super_admin_invitation(recipient_email text, target_neighborhood_id uuid, custom_message text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invitation_id uuid;
  invite_code_value text;
  admin_user_id uuid;
BEGIN
  admin_user_id := auth.uid();
  
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = admin_user_id 
    AND role = 'super_admin'::user_role
  ) THEN
    RAISE EXCEPTION 'Only super admins can use this function';
  END IF;
  
  invite_code_value := substr(md5(random()::text || clock_timestamp()::text), 1, 12);
  
  WHILE EXISTS (SELECT 1 FROM invitations WHERE invite_code = invite_code_value) LOOP
    invite_code_value := substr(md5(random()::text || clock_timestamp()::text), 1, 12);
  END LOOP;
  
  INSERT INTO invitations (
    neighborhood_id,
    inviter_id,
    email,
    invite_code,
    status
  ) VALUES (
    target_neighborhood_id,
    admin_user_id,
    recipient_email,
    invite_code_value,
    'pending'
  ) RETURNING id INTO invitation_id;
  
  INSERT INTO email_queue (
    recipient_email,
    template_type,
    template_data,
    neighborhood_id,
    user_id
  ) VALUES (
    recipient_email,
    'admin_invitation',
    jsonb_build_object(
      'invite_code', invite_code_value,
      'neighborhood_id', target_neighborhood_id,
      'inviter_id', admin_user_id,
      'custom_message', custom_message
    ),
    target_neighborhood_id,
    admin_user_id
  );
  
  RETURN invitation_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.join_neighborhood_as_actual_member(target_neighborhood_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_user_id uuid;
  is_super_admin boolean;
BEGIN
  admin_user_id := auth.uid();
  
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = admin_user_id 
    AND role = 'super_admin'::user_role
  ) INTO is_super_admin;
  
  IF NOT is_super_admin THEN
    RAISE EXCEPTION 'Only super admins can use this function';
  END IF;
  
  INSERT INTO neighborhood_members (
    user_id,
    neighborhood_id,
    status,
    joined_at
  ) VALUES (
    admin_user_id,
    target_neighborhood_id,
    'active',
    now()
  )
  ON CONFLICT (user_id, neighborhood_id) 
  DO UPDATE SET 
    status = 'active',
    joined_at = now();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_user_role(user_uuid uuid, target_role user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = user_uuid
    AND role = target_role
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.users_share_neighborhood(user1_uuid uuid, user2_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM neighborhood_members nm1
    INNER JOIN neighborhood_members nm2 ON nm1.neighborhood_id = nm2.neighborhood_id
    WHERE nm1.user_id = user1_uuid 
    AND nm2.user_id = user2_uuid
    AND nm1.status = 'active'
    AND nm2.status = 'active'
  ) OR EXISTS (
    SELECT 1
    FROM neighborhoods n
    INNER JOIN neighborhood_members nm ON n.id = nm.neighborhood_id
    WHERE n.created_by = user1_uuid
    AND nm.user_id = user2_uuid
    AND nm.status = 'active'
  ) OR EXISTS (
    SELECT 1
    FROM neighborhoods n
    INNER JOIN neighborhood_members nm ON n.id = nm.neighborhood_id
    WHERE n.created_by = user2_uuid
    AND nm.user_id = user1_uuid
    AND nm.status = 'active'
  ) OR EXISTS (
    SELECT 1
    FROM neighborhoods n1
    INNER JOIN neighborhoods n2 ON n1.id = n2.id
    WHERE n1.created_by = user1_uuid
    AND n2.created_by = user2_uuid
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_neighborhood_access(target_neighborhood_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = current_user_id 
    AND role = 'super_admin'::user_role
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM neighborhood_members
    WHERE user_id = current_user_id
    AND neighborhood_id = target_neighborhood_id
    AND status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM neighborhoods
    WHERE id = target_neighborhood_id
    AND created_by = current_user_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_unified_system_notification(
  target_user_id uuid,
  actor_user_id uuid,
  notification_title text,
  content_type_param text,
  content_id_param uuid,
  notification_type_param notification_type,
  action_type_param notification_action_type,
  action_label_param text,
  relevance_score_param integer,
  metadata_param jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_notification_id uuid;
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
    target_user_id,
    actor_user_id,
    notification_title,
    content_type_param,
    content_id_param,
    notification_type_param,
    action_type_param,
    action_label_param,
    relevance_score_param,
    metadata_param
  ) RETURNING id INTO new_notification_id;
  
  RETURN new_notification_id;
END;
$function$;