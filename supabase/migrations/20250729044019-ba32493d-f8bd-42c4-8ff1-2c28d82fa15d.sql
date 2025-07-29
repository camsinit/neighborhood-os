-- Delete the ycdemo@neighborhoodos.com account
-- First, find the user ID and then delete the account

DO $$
DECLARE
    target_user_uuid UUID;
    deletion_result JSONB;
BEGIN
    -- Find the user ID for ycdemo@neighborhoodos.com
    SELECT id INTO target_user_uuid 
    FROM auth.users 
    WHERE email = 'ycdemo@neighborhoodos.com';
    
    -- Check if user was found
    IF target_user_uuid IS NULL THEN
        RAISE NOTICE 'No user found with email: ycdemo@neighborhoodos.com';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found user with ID: %', target_user_uuid;
    
    -- Delete the user account using the existing function
    SELECT delete_user_account(target_user_uuid) INTO deletion_result;
    
    -- Output the result
    RAISE NOTICE 'Deletion result: %', deletion_result;
    
    -- If successful, also delete from auth.users (this requires admin privileges)
    IF (deletion_result->>'success')::boolean = true THEN
        DELETE FROM auth.users WHERE id = target_user_uuid;
        RAISE NOTICE 'User deleted from auth.users as well';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error occurred: %', SQLERRM;
END $$;