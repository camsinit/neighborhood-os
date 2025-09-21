-- Drop goods and safety tables and related data
-- This migration removes all goods_exchange and safety_updates tables and their dependencies

BEGIN;

-- Drop triggers first to prevent issues during table removal
DROP TRIGGER IF EXISTS create_goods_activity_trigger ON goods_exchange;
DROP TRIGGER IF EXISTS create_safety_update_activity_trigger ON safety_updates;
DROP TRIGGER IF EXISTS create_templated_safety_notification_trigger ON safety_updates;

-- Remove activities related to goods and safety
DELETE FROM activities WHERE content_type IN ('goods_exchange', 'safety_updates');

-- Remove notifications related to goods and safety
DELETE FROM notifications WHERE content_type IN ('goods', 'safety');

-- Remove shared items for goods and safety
DELETE FROM shared_items WHERE content_type IN ('goods_exchange', 'safety_updates');

-- Drop the tables
DROP TABLE IF EXISTS goods_exchange CASCADE;
DROP TABLE IF EXISTS safety_updates CASCADE;

-- Remove any functions specifically related to goods and safety
DROP FUNCTION IF EXISTS create_goods_activity() CASCADE;
DROP FUNCTION IF EXISTS create_safety_update_activity() CASCADE;

COMMIT;