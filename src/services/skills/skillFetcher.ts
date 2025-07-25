import { supabase } from '@/integrations/supabase/client';
import { SkillCategory } from '@/components/skills/types/skillTypes';

/**
 * Simple skill fetcher for URL-based sheet navigation
 * 
 * Fetches a skill by title for use with the unified sheet system.
 * Returns the first skill found with the given title since skills
 * are grouped by title in the sheet interface.
 */
export const fetchSkillByTitle = async (skillTitle: string) => {
  // Decode the skill title from URL parameters
  const decodedTitle = decodeURIComponent(skillTitle);
  
  // Fetch the first skill with this title to get category and basic info
  const { data, error } = await supabase
    .from('skills_exchange')
    .select(`
      *,
      profiles (
        avatar_url,
        display_name
      )
    `)
    .eq('title', decodedTitle)
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error fetching skill by title:', error);
    return null;
  }
  
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