-- Update existing skill offer activities to use the new simplified format
-- Changes titles like "John offered Website Help" to "John offered some new skills" 
-- for activities that were part of bulk skill offerings

UPDATE activities 
SET title = COALESCE(p.display_name, 'A neighbor') || ' offered some new skills'
FROM profiles p
WHERE p.id = activities.actor_id
  AND activities.activity_type = 'skill_offered'
  AND activities.created_at IN (
    -- Find activities that were created as part of bulk skill offerings
    -- (multiple skill offers from the same user within 1 minute)
    SELECT DISTINCT a1.created_at
    FROM activities a1
    JOIN activities a2 ON a1.actor_id = a2.actor_id 
      AND a1.activity_type = 'skill_offered' 
      AND a2.activity_type = 'skill_offered'
      AND a1.id != a2.id
      AND ABS(EXTRACT(EPOCH FROM (a1.created_at - a2.created_at))) <= 60
    WHERE a1.activity_type = 'skill_offered'
    GROUP BY a1.actor_id, a1.created_at
    HAVING COUNT(*) >= 3
  );