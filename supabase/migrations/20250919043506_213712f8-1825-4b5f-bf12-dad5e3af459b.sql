-- Add new activity type for group creation
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'group_created';

-- Add 'groups' to notification_type enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'notification_type' AND e.enumlabel = 'groups') THEN
    ALTER TYPE notification_type ADD VALUE 'groups';
  END IF;
END
$$;