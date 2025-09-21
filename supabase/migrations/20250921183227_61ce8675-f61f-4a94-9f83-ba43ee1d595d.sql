-- Check if user already has super_admin role, if not, insert it
INSERT INTO user_roles (user_id, role)
SELECT 'a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf'::uuid, 'super_admin'::user_role
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = 'a84ed330-2ec5-4472-9e0c-a80ea7bd1dcf'::uuid 
  AND role = 'super_admin'::user_role
);