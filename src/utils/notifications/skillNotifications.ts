
/**
 * Utility functions for handling skill notifications
 */
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";

// Create a logger for this module
const logger = createLogger('skillNotifications');

/**
 * Fetch skills from the skills_exchange table
 * 
 * @param userId - The user's ID
 * @returns Array of skill categories
 */
export const fetchUserSkills = async (userId: string): Promise<string[]> => {
  try {
    const { data: skillsData, error: skillsError } = await supabase
      .from("skills_exchange")
      .select("skill_category")
      .eq("user_id", userId)
      .eq("request_type", "offer");

    if (skillsError) {
      logger.error("Error loading skills:", skillsError);
      return [];
    }

    // Extract unique skill categories
    return skillsData ? 
      [...new Set(skillsData.map(item => item.skill_category))] : 
      [];
    
  } catch (error) {
    logger.error("Unexpected error fetching skills:", error);
    return [];
  }
};
