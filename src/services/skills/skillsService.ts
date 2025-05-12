
import { supabase } from '@/integrations/supabase/client';
import { SkillCategory, SkillWithProfile } from '@/components/skills/types/skillTypes';
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
  // Start the query builder
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
  
  // Apply category filter if specified
  if (category) {
    query = query.eq('skill_category', category);
  }
  
  // Execute the query
  const { data, error } = await query;
  
  if (error) {
    logger.error('Error fetching skills:', error);
    throw error;
  }

  return data as any[]; // Type assertion will be handled by the context
};

/**
 * Create a new skill
 * 
 * This function:
 * 1. Validates essential data
 * 2. Inserts the skill into the database
 * 3. Relies on database triggers to create the activity (with edge function as fallback)
 */
export const createSkill = async (
  formData: Partial<SkillFormData>,
  mode: 'offer' | 'request',
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
    request_type: mode === 'offer' ? 'offer' : 'need', // Ensure consistent values
    user_id: userId,
    neighborhood_id: neighborhoodId,
    skill_category: formData.category,
    valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    availability: formData.availability || null,
    time_preferences: formData.timePreference || null
  };

  // Log the exact SQL payload for debugging
  logger.info('Insert payload:', JSON.stringify(insertData, null, 2));

  try {
    // Insert the skill into the database
    const { error, data } = await supabase.from('skills_exchange').insert(insertData).select();

    if (error) {
      // Detailed error logging
      logger.error('Error creating skill:', {
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
    logger.info('Skill created successfully:', {
      skillId: data?.[0]?.id,
      title: formData.title,
      userId,
      timestamp: new Date().toISOString()
    });

    // Call edge function to register the activity as a fallback
    // The database trigger should handle this, but we call the edge function as a backup
    try {
      logger.info('Calling edge function to create activity...');
      
      // This is just a fallback - it's okay if it fails since we're primarily using the database trigger
      const response = await fetch('/api/notify-skills-changes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession() && (await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          skillId: data?.[0]?.id,
          action: 'create',
          skillTitle: formData.title,
          providerId: mode === 'offer' ? userId : undefined,
          requesterId: mode === 'request' ? userId : undefined,
          neighborhoodId: neighborhoodId,
          description: formData.description,
          category: formData.category,
          requestType: mode === 'offer' ? 'offer' : 'need'
        }),
      });
      
      if (!response.ok) {
        logger.error('Edge function error:', await response.text());
      } else {
        logger.info('Activity created via edge function');
      }
    } catch (edgeError) {
      // Log but don't fail if edge function fails - fallback to database trigger
      logger.error('Failed to call edge function, falling back to database trigger:', edgeError);
      logger.info('The database trigger will handle activity creation');
    }

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
 * Delete a skill
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

  // Delete the skill
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
    throw error;
  }

  logger.info('Skill deleted successfully:', {
    skillId,
    userId,
    timestamp: new Date().toISOString()
  });
};

/**
 * Check for duplicate skills
 */
export const checkForDuplicates = async (
  title: string,
  category: string,
  mode: 'offer' | 'request'
) => {
  // Query for similar skills
  const { data, error } = await supabase
    .from('skills_exchange')
    .select()
    .eq('request_type', mode)
    .eq('skill_category', category)
    .ilike('title', `%${title}%`);

  if (error) {
    logger.error('Error checking for duplicates:', error);
    throw error;
  }

  return data;
};
