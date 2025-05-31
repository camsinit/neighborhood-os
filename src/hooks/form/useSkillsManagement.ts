
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
    // Exit early if no skills to save
    if (!skills || skills.length === 0) {
      console.log('No skills to save, skipping skills creation');
      return;
    }

    // Validate required parameters
    if (!userId) {
      throw new Error('User ID is required to save skills');
    }

    if (!neighborhoodId) {
      throw new Error('Neighborhood ID is required to save skills');
    }

    try {
      console.log('Saving skills for user:', userId, 'in neighborhood:', neighborhoodId);
      console.log('Skills to save:', skills);
      console.log('Availability:', availability);
      console.log('Time preferences:', timePreferences);

      // Parse and prepare skills data with proper validation
      const skillsData = skills.map(skillString => {
        const { name, details } = parseSkill(skillString);
        const skillCategory = getSkillCategory(name);
        
        // Create the skill record with all required fields
        return {
          title: name,
          description: details || null,
          skill_category: skillCategory,
          request_type: 'offer', // Default to offer for onboarding skills
          user_id: userId,
          neighborhood_id: neighborhoodId,
          availability: availability || null,
          time_preferences: timePreferences || null,
          valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          is_archived: false,
        };
      });

      console.log('Prepared skills data for insertion:', skillsData);

      // Insert skills into database with error handling
      const { data, error } = await supabase
        .from('skills_exchange')
        .insert(skillsData)
        .select(); // Select to get the inserted records

      if (error) {
        console.error('Database error saving skills:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Skills saved successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in saveSkills function:', error);
      // Re-throw with more context
      throw new Error(`Failed to save skills: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return { saveSkills };
};
