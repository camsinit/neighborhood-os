-- Fix account deletion to include shared_items and improve completeness
-- This ensures complete data removal while allowing re-registration

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

-- Create a verification function to check if user data was completely removed
CREATE OR REPLACE FUNCTION public.verify_user_deletion(target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.verify_user_deletion TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_user_deletion TO service_role;