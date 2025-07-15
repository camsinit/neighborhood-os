-- Delete all data related to neighborhood 3ff9197a-46f0-433f-a951-734771178475
-- This will cascade through all related tables

-- First, delete comments on safety updates in this neighborhood
DELETE FROM safety_update_comments 
WHERE safety_update_id IN (
  SELECT id FROM safety_updates 
  WHERE neighborhood_id = '3ff9197a-46f0-433f-a951-734771178475'
);

-- Delete skill contributors for skills in this neighborhood
DELETE FROM skill_contributors 
WHERE skill_id IN (
  SELECT id FROM skills_exchange 
  WHERE neighborhood_id = '3ff9197a-46f0-433f-a951-734771178475'
);

-- Delete activities for this neighborhood
DELETE FROM activities WHERE neighborhood_id = '3ff9197a-46f0-433f-a951-734771178475';

-- Delete care requests for this neighborhood
DELETE FROM care_requests WHERE neighborhood_id = '3ff9197a-46f0-433f-a951-734771178475';

-- Delete event RSVPs for events in this neighborhood
DELETE FROM event_rsvps WHERE neighborhood_id = '3ff9197a-46f0-433f-a951-734771178475';

-- Delete events for this neighborhood
DELETE FROM events WHERE neighborhood_id = '3ff9197a-46f0-433f-a951-734771178475';

-- Delete goods exchange for this neighborhood
DELETE FROM goods_exchange WHERE neighborhood_id = '3ff9197a-46f0-433f-a951-734771178475';

-- Delete invitations for this neighborhood
DELETE FROM invitations WHERE neighborhood_id = '3ff9197a-46f0-433f-a951-734771178475';

-- Delete neighborhood roles for this neighborhood
DELETE FROM neighborhood_roles WHERE neighborhood_id = '3ff9197a-46f0-433f-a951-734771178475';

-- Delete neighborhood members for this neighborhood
DELETE FROM neighborhood_members WHERE neighborhood_id = '3ff9197a-46f0-433f-a951-734771178475';

-- Delete safety updates for this neighborhood
DELETE FROM safety_updates WHERE neighborhood_id = '3ff9197a-46f0-433f-a951-734771178475';

-- Delete shared items for this neighborhood
DELETE FROM shared_items WHERE neighborhood_id = '3ff9197a-46f0-433f-a951-734771178475';

-- Delete skills exchange for this neighborhood
DELETE FROM skills_exchange WHERE neighborhood_id = '3ff9197a-46f0-433f-a951-734771178475';

-- Delete notifications related to content in this neighborhood
DELETE FROM notifications 
WHERE content_id IN (
  SELECT id FROM events WHERE neighborhood_id = '3ff9197a-46f0-433f-a951-734771178475'
  UNION
  SELECT id FROM safety_updates WHERE neighborhood_id = '3ff9197a-46f0-433f-a951-734771178475'
  UNION
  SELECT id FROM skills_exchange WHERE neighborhood_id = '3ff9197a-46f0-433f-a951-734771178475'
  UNION
  SELECT id FROM goods_exchange WHERE neighborhood_id = '3ff9197a-46f0-433f-a951-734771178475'
  UNION
  SELECT id FROM care_requests WHERE neighborhood_id = '3ff9197a-46f0-433f-a951-734771178475'
);

-- Finally, delete the neighborhood itself
DELETE FROM neighborhoods WHERE id = '3ff9197a-46f0-433f-a951-734771178475';