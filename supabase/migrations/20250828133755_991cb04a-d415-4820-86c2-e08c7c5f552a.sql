-- Create a secure function for neighborhood deletion by admins
-- This function handles cascading deletion of all related data safely
CREATE OR REPLACE FUNCTION public.admin_delete_neighborhood(
  neighborhood_uuid uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_id uuid;
  is_neighborhood_admin boolean;
  deletion_log jsonb := '{}';
  affected_rows integer;
BEGIN
  -- Get the current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Authentication required'
    );
  END IF;

  -- Check if current user is admin of this neighborhood
  SELECT user_is_neighborhood_admin(current_user_id, neighborhood_uuid) INTO is_neighborhood_admin;
  
  IF NOT is_neighborhood_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Only neighborhood admins can delete neighborhoods'
    );
  END IF;

  -- Log the deletion attempt
  RAISE LOG '[admin_delete_neighborhood] User % attempting to delete neighborhood %', current_user_id, neighborhood_uuid;

  BEGIN
    -- Delete all related data in proper order (respecting foreign key constraints)
    
    -- Delete activities
    DELETE FROM activities WHERE neighborhood_id = neighborhood_uuid;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    deletion_log := jsonb_set(deletion_log, '{activities}', to_jsonb(affected_rows));

    -- Delete notifications related to this neighborhood's content
    DELETE FROM notifications WHERE content_id IN (
      SELECT id FROM events WHERE neighborhood_id = neighborhood_uuid
      UNION ALL
      SELECT id FROM safety_updates WHERE neighborhood_id = neighborhood_uuid
      UNION ALL
      SELECT id FROM skills_exchange WHERE neighborhood_id = neighborhood_uuid
      UNION ALL
      SELECT id FROM goods_exchange WHERE neighborhood_id = neighborhood_uuid
    );
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    deletion_log := jsonb_set(deletion_log, '{notifications}', to_jsonb(affected_rows));

    -- Delete event RSVPs
    DELETE FROM event_rsvps WHERE neighborhood_id = neighborhood_uuid;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    deletion_log := jsonb_set(deletion_log, '{event_rsvps}', to_jsonb(affected_rows));

    -- Delete safety update comments
    DELETE FROM safety_update_comments WHERE safety_update_id IN (
      SELECT id FROM safety_updates WHERE neighborhood_id = neighborhood_uuid
    );
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    deletion_log := jsonb_set(deletion_log, '{safety_comments}', to_jsonb(affected_rows));

    -- Delete shared items
    DELETE FROM shared_items WHERE neighborhood_id = neighborhood_uuid;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    deletion_log := jsonb_set(deletion_log, '{shared_items}', to_jsonb(affected_rows));

    -- Delete main content tables
    DELETE FROM events WHERE neighborhood_id = neighborhood_uuid;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    deletion_log := jsonb_set(deletion_log, '{events}', to_jsonb(affected_rows));

    DELETE FROM safety_updates WHERE neighborhood_id = neighborhood_uuid;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    deletion_log := jsonb_set(deletion_log, '{safety_updates}', to_jsonb(affected_rows));

    DELETE FROM skills_exchange WHERE neighborhood_id = neighborhood_uuid;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    deletion_log := jsonb_set(deletion_log, '{skills_exchange}', to_jsonb(affected_rows));

    DELETE FROM goods_exchange WHERE neighborhood_id = neighborhood_uuid;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    deletion_log := jsonb_set(deletion_log, '{goods_exchange}', to_jsonb(affected_rows));

    -- Delete invitations
    DELETE FROM invitations WHERE neighborhood_id = neighborhood_uuid;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    deletion_log := jsonb_set(deletion_log, '{invitations}', to_jsonb(affected_rows));

    -- Delete neighborhood roles
    DELETE FROM neighborhood_roles WHERE neighborhood_id = neighborhood_uuid;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    deletion_log := jsonb_set(deletion_log, '{neighborhood_roles}', to_jsonb(affected_rows));

    -- Delete neighborhood memberships
    DELETE FROM neighborhood_members WHERE neighborhood_id = neighborhood_uuid;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    deletion_log := jsonb_set(deletion_log, '{neighborhood_members}', to_jsonb(affected_rows));

    -- Finally, delete the neighborhood itself
    DELETE FROM neighborhoods WHERE id = neighborhood_uuid;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    deletion_log := jsonb_set(deletion_log, '{neighborhood}', to_jsonb(affected_rows));

    -- Log successful deletion
    RAISE LOG '[admin_delete_neighborhood] Successfully deleted neighborhood % - Deletion log: %', neighborhood_uuid, deletion_log;

    RETURN jsonb_build_object(
      'success', true,
      'message', 'Neighborhood and all associated data deleted successfully',
      'deletion_log', deletion_log
    );

  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG '[admin_delete_neighborhood] Error deleting neighborhood %: %', neighborhood_uuid, SQLERRM;
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Failed to delete neighborhood: ' || SQLERRM
      );
  END;
END;
$$;