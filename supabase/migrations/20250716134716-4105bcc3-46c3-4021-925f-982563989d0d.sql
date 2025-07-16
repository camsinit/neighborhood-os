-- Comprehensive fix for all duplicate activity/notification triggers
-- This migration removes ALL duplicate triggers that cause double activity creation

-- 1. Fix care_requests duplicates
DROP TRIGGER IF EXISTS create_care_activity ON care_requests;
DROP FUNCTION IF EXISTS public.create_care_activity();

-- 2. Fix neighborhood_members duplicates (your current issue)
DROP TRIGGER IF EXISTS neighborhood_members_activity_trigger ON neighborhood_members;
DROP FUNCTION IF EXISTS public.create_neighbor_join_activity();

-- 3. Fix safety_update_comments duplicates
DROP TRIGGER IF EXISTS create_notification_on_safety_comment ON safety_update_comments;
DROP TRIGGER IF EXISTS notify_safety_comment ON safety_update_comments;

-- 4. Clean up any existing duplicate activities from these tables
-- Remove duplicate neighbor join activities (keep the most recent one for each user/neighborhood)
DELETE FROM activities a1
WHERE a1.content_type = 'neighbors' 
  AND a1.activity_type = 'neighbor_joined'
  AND EXISTS (
    SELECT 1 FROM activities a2
    WHERE a2.content_type = 'neighbors'
      AND a2.activity_type = 'neighbor_joined'
      AND a2.actor_id = a1.actor_id
      AND a2.neighborhood_id = a1.neighborhood_id
      AND a2.created_at > a1.created_at
  );

-- Remove duplicate care request activities (keep the most recent one for each request)
DELETE FROM activities a1
WHERE a1.content_type = 'care_requests'
  AND EXISTS (
    SELECT 1 FROM activities a2
    WHERE a2.content_type = 'care_requests'
      AND a2.content_id = a1.content_id
      AND a2.created_at > a1.created_at
  );

-- Remove duplicate safety comment activities (keep the most recent one for each comment)
DELETE FROM activities a1
WHERE a1.content_type = 'safety_update_comments'
  AND EXISTS (
    SELECT 1 FROM activities a2
    WHERE a2.content_type = 'safety_update_comments'
      AND a2.content_id = a1.content_id
      AND a2.created_at > a1.created_at
  );

-- Log the cleanup
RAISE LOG 'Duplicate activity triggers removed and existing duplicates cleaned up';

-- Add comments to document the remaining triggers
COMMENT ON TRIGGER create_templated_neighbor_join_notification_trigger ON neighborhood_members IS 
  'Single trigger for neighbor join - creates both activity and notifications';

COMMENT ON TRIGGER care_requests_create_activity_trigger ON care_requests IS 
  'Single trigger for care request activities';

COMMENT ON TRIGGER create_templated_safety_comment_notification_trigger ON safety_update_comments IS 
  'Single trigger for safety comment notifications';