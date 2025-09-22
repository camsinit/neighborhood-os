import { supabase } from '@/integrations/supabase/client';
import { SkillCategory } from '@/components/skills/types/skillTypes';

/**
 * Simple skill fetcher for URL-based sheet navigation
 * 
 * Fetches a skill by title or ID for use with the unified sheet system.
 * Returns the first skill found with the given title since skills
 * are grouped by title in the sheet interface.
 * 
 * Updated to handle both skill IDs (from activity navigation) and titles (from direct URLs).
 */
export const fetchSkillByTitle = async (skillIdentifier: string) => {
  // Decode the skill identifier from URL parameters
  const decodedIdentifier = decodeURIComponent(skillIdentifier);
  
  // Check if the identifier looks like a UUID (skill ID) or a title
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decodedIdentifier);
  
  let query = supabase
    .from('skills_exchange')
    .select(`
      *,
      profiles (
        avatar_url,
        display_name
      )
    `);
  
  // Query by ID if it's a UUID, otherwise by title
  if (isUuid) {
    query = query.eq('id', decodedIdentifier);
  } else {
    query = query.eq('title', decodedIdentifier);
  }
  
  const { data, error } = await query.limit(1).single();
  
  if (error) {
    console.error('Error fetching skill by identifier:', error, {
      identifier: decodedIdentifier,
      isUuid,
      queryType: isUuid ? 'id' : 'title'
    });
    return null;
  }
  
  console.log('Successfully fetched skill:', {
    identifier: decodedIdentifier,
    isUuid,
    queryType: isUuid ? 'id' : 'title',
    skillTitle: data?.title,
    skillId: data?.id
  });
  
  // Return the skill data in a format compatible with SkillSheetContent
  return {
    id: data.id,
    title: data.title,
    category: data.skill_category as SkillCategory,
    description: data.description,
    created_at: data.created_at,
    user_id: data.user_id,
    neighborhood_id: data.neighborhood_id,
    request_type: data.request_type,
    profiles: data.profiles
  };
};