
import { supabase } from '@/integrations/supabase/client';
import { SkillCategory, SkillWithProfile, mapToCurrentCategory } from '@/components/skills/types/skillTypes';
import { SkillFormData } from '@/components/skills/types/skillFormTypes';
import { createLogger } from '@/utils/logger';

// Create a dedicated logger for this service
const logger = createLogger('skillsService');

/**
 * Fetch skills from the database
 * 
 * @param category Optional category to filter by
 */
export const fetchSkills = async (category?: SkillCategory) => {
  // Start the query builder - fetch all skills first
  let query = supabase
    .from('skills_exchange')
    .select(`
      *,
      profiles (
        avatar_url,
        display_name
      )
    `)
    .order('created_at', { ascending: false });
  
  // Execute the query
  const { data: allData, error } = await query;
  
  if (error) {
    logger.error('Error fetching skills:', error);
    throw error;
  }

  // Apply category filter using legacy mapping if specified
  let data = allData;
  if (category) {
    data = allData?.filter(skill => 
      mapToCurrentCategory(skill.skill_category) === category
    ) || [];
  }

  return data as any[]; // Type assertion will be handled by the context
};

/**
 * Create a new skill
 * 
 * This function:
 * 1. Validates essential data
 * 2. Inserts the skill into the database
 * 3. Database trigger will create the activity automatically
 */
export const createSkill = async (
  formData: Partial<SkillFormData>,
  mode: 'offer' | 'need',
  userId: string,
  neighborhoodId: string
) => {
  // Validate essential data
  if (!formData.title || !formData.category) {
    throw new Error('Title and category are required');
  }

  // Log the skill data we're about to insert for debugging
  logger.info('Attempting to insert skill with data:', {
    title: formData.title,
    description: formData.description?.substring(0, 30) + '...',
    mode,
    category: formData.category,
    userId,
    neighborhoodId,
    timestamp: new Date().toISOString()
  });

  // Create the insert data object with all fields explicitly defined
  const insertData = {
    title: formData.title,
    description: formData.description || null,
    request_type: mode, // Direct use since mode is already 'offer' | 'need'
    user_id: userId,
    neighborhood_id: neighborhoodId,
    skill_category: formData.category,
    valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    availability: formData.availability || null,
    time_preferences: formData.timePreference || null
  };

  try {
    logger.info('=== SKILL CREATION STARTED ===', {
      title: formData.title,
      mode,
      category: formData.category,
      userId,
      neighborhoodId
    });

    logger.info('SKILL CREATE: Inserting skill record');
    // Insert the skill into the database
    // The database trigger will handle creating the activity
    const { error, data } = await supabase.from('skills_exchange').insert(insertData).select();

    if (error) {
      // Detailed error logging
      logger.error('=== SKILL CREATION FAILED ===', {
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        },
        userId,
        neighborhoodId,
        requestPayload: JSON.stringify(insertData),
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    // Log success data
    logger.info('=== SKILL CREATION SUCCESS ===', {
      skillId: data?.[0]?.id,
      title: formData.title,
      userId,
      message: 'Database triggers should now create activity + notifications',
      timestamp: new Date().toISOString()
    });

    return data;
  } catch (error) {
    logger.error('Unexpected error:', error);
    throw error;
  }
};

/**
 * Update an existing skill
 */
export const updateSkill = async (
  skillId: string,
  formData: Partial<SkillFormData>,
  userId: string
) => {
  // Prepare update data
  const updateData: any = {};
  
  if (formData.title) updateData.title = formData.title;
  if (formData.description !== undefined) updateData.description = formData.description || null;
  if (formData.category) updateData.skill_category = formData.category;
  if (formData.availability !== undefined) updateData.availability = formData.availability || null;
  if (formData.timePreference !== undefined) updateData.time_preferences = formData.timePreference || null;
  
  // Log update attempt
  logger.info('Attempting to update skill:', {
    skillId,
    userId,
    updateFields: Object.keys(updateData),
    timestamp: new Date().toISOString()
  });
  
  // Update the skill
  const { error } = await supabase
    .from('skills_exchange')
    .update(updateData)
    .eq('id', skillId)
    .eq('user_id', userId);
  
  if (error) {
    logger.error('Error updating skill:', {
      error: {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      },
      skillId,
      userId,
      updateData: JSON.stringify(updateData),
      timestamp: new Date().toISOString()
    });
    throw error;
  }

  logger.info('Skill updated successfully:', {
    skillId,
    userId,
    timestamp: new Date().toISOString()
  });
};

/**
 * Delete a skill - simplified version without session checking
 * 
 * Returns an object with details about the operation success or error
 */
export const deleteSkill = async (
  skillId: string,
  skillTitle: string,
  userId: string
) => {
  // Log deletion attempt
  logger.info('Attempting to delete skill:', {
    skillId,
    skillTitle, 
    userId,
    timestamp: new Date().toISOString()
  });

  // Direct skill deletion without session checking
  const { error } = await supabase
    .from('skills_exchange')
    .delete()
    .eq('id', skillId)
    .eq('user_id', userId);

  if (error) {
    logger.error('Error deleting skill:', {
      error: {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      },
      skillId,
      userId,
      timestamp: new Date().toISOString()
    });
    return { 
      success: false, 
      error 
    };
  }

  logger.info('Skill deleted successfully:', {
    skillId,
    userId,
    timestamp: new Date().toISOString()
  });
  
  return { success: true };
};

/**
 * Check for duplicate skills
 */
export const checkForDuplicates = async (
  title: string,
  category: string,
  mode: 'offer' | 'need'
) => {
  // Query for all similar skills first, then filter by mapped category
  const { data: allData, error } = await supabase
    .from('skills_exchange')
    .select()
    .eq('request_type', mode)
    .ilike('title', `%${title}%`);

  if (error) {
    logger.error('Error checking for duplicates:', error);
    throw error;
  }

  // Filter by mapped category (includes legacy category mapping)
  const data = allData?.filter(skill => 
    mapToCurrentCategory(skill.skill_category) === category
  ) || [];

  return data;
};
