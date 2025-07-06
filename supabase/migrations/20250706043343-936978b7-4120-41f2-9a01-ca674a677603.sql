-- Add delete function for activities (debug mode only)
CREATE OR REPLACE FUNCTION public.delete_activity_debug(activity_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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