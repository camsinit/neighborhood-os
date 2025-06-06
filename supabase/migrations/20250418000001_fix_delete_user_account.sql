
-- Fix the delete_user_account function to remove references to non-existent skill session tables
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
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

  -- Delete skill contributors (this table exists)
  DELETE FROM skill_contributors WHERE user_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{skill_contributors}', to_jsonb(affected_rows));

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

  -- Delete user profile
  DELETE FROM profiles WHERE id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{profile}', to_jsonb(affected_rows));

  -- Log the deletion for audit purposes
  RAISE LOG 'User account deleted: % - Deletion log: %', target_user_id, deletion_log;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Account and all associated data deleted successfully',
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.delete_user_account TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_account TO service_role;
