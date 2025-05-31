
import { supabase } from "@/integrations/supabase/client";
import { SKILL_CATEGORIES } from "@/components/onboarding/survey/steps/skills/skillCategories";

/**
 * Hook for managing user skills during onboarding
 */
export const useSkillsManagement = () => {
  /**
   * Determine skill category for a given skill name
   */
  const getSkillCategory = (skillName: string): string => {
    for (const [categoryKey, categoryData] of Object.entries(SKILL_CATEGORIES)) {
      if (categoryData.skills.includes(skillName)) {
        return categoryKey;
      }
    }
    // Default category if not found
    return 'general';
  };

  /**
   * Parse skill name and details from formatted string
   */
  const parseSkill = (skillString: string): { name: string; details?: string } => {
    if (skillString.includes(': ')) {
      const [name, details] = skillString.split(': ');
      return { name: name.trim(), details: details.trim() };
    }
    return { name: skillString.trim() };
  };

  /**
   * Save skills to skills_exchange table
   */
  const saveSkills = async (
    skills: string[], 
    userId: string,
    availability?: string, 
    timePreferences?: string[],
    neighborhoodId?: string
  ) => {
    if (skills.length === 0) return;

    try {
      // Parse and prepare skills data
      const skillsData = skills.map(skillString => {
        const { name, details } = parseSkill(skillString);
        const skillCategory = getSkillCategory(name);
        
        return {
          title: name,
          description: details || null,
          skill_category: skillCategory,
          request_type: 'offer',
          user_id: userId,
          neighborhood_id: neighborhoodId,
          availability: availability || null,
          time_preferences: timePreferences || null,
          valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          is_archived: false,
        };
      });

      // Insert skills into database
      const { error } = await supabase
        .from('skills_exchange')
        .insert(skillsData);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving skills:', error);
      throw new Error('Failed to save skills');
    }
  };

  return { saveSkills };
};
