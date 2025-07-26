-- Migration script to update existing activity titles with neighbor names and verbs
-- This updates all existing activities to follow the "[Neighbor Name] [Verb] [Activity Title]" format

UPDATE activities 
SET title = CASE 
  -- Handle event activities
  WHEN activity_type = 'event_created' THEN 
    COALESCE(p.display_name, 'A neighbor') || ' created ' || 
    COALESCE((SELECT title FROM events WHERE id = activities.content_id), 'an event')
    
  -- Handle safety update activities  
  WHEN activity_type = 'safety_update' THEN 
    COALESCE(p.display_name, 'A neighbor') || ' shared ' || 
    COALESCE((SELECT title FROM safety_updates WHERE id = activities.content_id), 'a safety update')
    
  -- Handle skill offer activities
  WHEN activity_type = 'skill_offered' THEN 
    COALESCE(p.display_name, 'A neighbor') || ' offered ' || 
    COALESCE((SELECT title FROM skills_exchange WHERE id = activities.content_id), 'a skill')
    
  -- Handle skill request activities
  WHEN activity_type = 'skill_requested' THEN 
    COALESCE(p.display_name, 'A neighbor') || ' requested ' || 
    COALESCE((SELECT title FROM skills_exchange WHERE id = activities.content_id), 'a skill')
    
  -- Handle goods shared activities
  WHEN activity_type = 'good_shared' THEN 
    COALESCE(p.display_name, 'A neighbor') || ' shared ' || 
    COALESCE((SELECT title FROM goods_exchange WHERE id = activities.content_id), 'an item')
    
  -- Handle goods requested activities
  WHEN activity_type = 'good_requested' THEN 
    COALESCE(p.display_name, 'A neighbor') || ' requested ' || 
    COALESCE((SELECT title FROM goods_exchange WHERE id = activities.content_id), 'an item')
    
  -- Handle neighbor joined activities (special case - no content to join with)
  WHEN activity_type = 'neighbor_joined' THEN 
    COALESCE(p.display_name, 'A neighbor') || ' joined'
    
  -- Handle profile updated activities (special case - no content to join with)
  WHEN activity_type = 'profile_updated' THEN 
    COALESCE(p.display_name, 'A neighbor') || ' updated their profile'
    
  -- Keep existing title if we don't recognize the activity type
  ELSE activities.title
END
FROM profiles p 
WHERE p.id = activities.actor_id
  AND (
    -- Only update activities that don't already follow the pattern
    activities.title NOT LIKE COALESCE(p.display_name, 'A neighbor') || ' %'
    OR activities.title LIKE 'A new neighbor%'
    OR activities.title NOT LIKE '% %' -- titles without spaces (likely just activity names)
  );