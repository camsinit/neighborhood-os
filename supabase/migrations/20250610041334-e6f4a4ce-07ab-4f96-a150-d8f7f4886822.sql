
-- Check if "Yard Work" skill was registered for the specific user
SELECT 
  id,
  title,
  description,
  skill_category,
  request_type,
  user_id,
  neighborhood_id,
  created_at,
  is_archived
FROM skills_exchange 
WHERE user_id = '74bf3085-8275-4eb2-a721-8c8e91b3d3d8'
  AND title ILIKE '%Yard Work%'
ORDER BY created_at DESC;

-- Also check all recent skills for this user to see what was actually added
SELECT 
  id,
  title,
  skill_category,
  request_type,
  created_at
FROM skills_exchange 
WHERE user_id = '74bf3085-8275-4eb2-a721-8c8e91b3d3d8'
  AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Check if there are any activities created for skills by this user recently
-- Using the correct activity_type values: 'skill_offered' or 'skill_requested'
SELECT 
  id,
  title,
  activity_type,
  content_type,
  created_at,
  metadata
FROM activities 
WHERE actor_id = '74bf3085-8275-4eb2-a721-8c8e91b3d3d8'
  AND activity_type IN ('skill_offered', 'skill_requested')
  AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
