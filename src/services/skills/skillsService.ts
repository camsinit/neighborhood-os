
/**
 * Skills Service
 * 
 * This service provides a centralized place for all skills-related data operations.
 * It abstracts database access and ensures consistent data handling.
 */
import { supabase } from "@/integrations/supabase/client";
import { Skill, SkillCategory } from "@/components/skills/types/skillTypes";
import { SkillFormData } from "@/components/skills/types/skillFormTypes";
import { toast } from "sonner";

/**
 * Fetches skills with optional category filtering
 */
export const fetchSkills = async (category?: SkillCategory) => {
  try {
    let query = supabase.from('skills_exchange').select(`
      *,
      profiles:user_id (
        avatar_url,
        display_name
      )
    `).order('created_at', { ascending: false });
    
    if (category) {
      query = query.eq('skill_category', category);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
    
  } catch (error) {
    console.error("Error fetching skills:", error);
    throw error;
  }
};

/**
 * Creates a new skill (offer or request)
 */
export const createSkill = async (
  formData: Partial<SkillFormData>, 
  mode: 'offer' | 'request',
  userId: string,
  neighborhoodId: string
) => {
  try {
    // Validate required fields
    if (!formData.title || !formData.category) {
      throw new Error("Missing required fields");
    }

    const skillData = {
      title: formData.title,
      description: formData.description || null,
      request_type: mode === 'offer' ? 'offer' : 'need',
      user_id: userId,
      neighborhood_id: neighborhoodId,
      skill_category: formData.category,
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      availability: formData.availability || null,
      time_preferences: formData.timePreference || []
    };

    const { data, error } = await supabase
      .from('skills_exchange')
      .insert(skillData)
      .select();

    if (error) throw error;
    return data?.[0];
    
  } catch (error) {
    console.error("Error creating skill:", error);
    throw error;
  }
};

/**
 * Updates an existing skill
 */
export const updateSkill = async (
  skillId: string,
  formData: Partial<SkillFormData>,
  userId: string
) => {
  try {
    // Validate required fields
    if (!formData.title) {
      throw new Error("Title is required");
    }

    const updateData = {
      title: formData.title,
      description: formData.description || null,
      skill_category: formData.category,
      availability: formData.availability || null,
      time_preferences: formData.timePreference || []
    };

    const { data, error } = await supabase
      .from('skills_exchange')
      .update(updateData)
      .eq('id', skillId)
      .eq('user_id', userId)  // Security check
      .select();

    if (error) throw error;
    return data?.[0];
    
  } catch (error) {
    console.error("Error updating skill:", error);
    throw error;
  }
};

/**
 * Deletes a skill and syncs related activities
 */
export const deleteSkill = async (skillId: string, skillTitle: string, userId: string) => {
  try {
    // Delete the skill
    const { error: deleteError } = await supabase
      .from('skills_exchange')
      .delete()
      .eq('id', skillId)
      .eq('user_id', userId); // Security check - only owner can delete

    if (deleteError) throw deleteError;

    // Notify about the change for activity feed updates
    try {
      await supabase.functions.invoke('notify-skills-changes', {
        body: {
          skillId,
          action: 'delete',
          skillTitle,
          changes: 'Skill deleted'
        }
      });
    } catch (functionError) {
      console.error("Error updating activities:", functionError);
      // Non-critical error, don't fail the operation
    }

    return true;
    
  } catch (error) {
    console.error("Error deleting skill:", error);
    throw error;
  }
};

/**
 * Checks for similar skills to avoid duplicates
 */
export const checkForDuplicates = async (
  title: string,
  category: string,
  mode: 'offer' | 'request'
) => {
  try {
    const { data, error } = await supabase
      .from('skills_exchange')
      .select('id, title')
      .ilike('title', `%${title}%`)
      .eq('skill_category', category)
      .eq('request_type', mode === 'offer' ? 'offer' : 'need');

    if (error) throw error;
    return data;
    
  } catch (error) {
    console.error("Error checking for duplicates:", error);
    return [];
  }
};
