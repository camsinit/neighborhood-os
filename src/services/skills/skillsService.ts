import { supabase } from '@/integrations/supabase/client';
import { SkillCategory, SkillWithProfile } from '@/components/skills/types/skillTypes';
import { SkillFormData } from '@/components/skills/types/skillFormTypes';

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
    console.error('Error fetching skills:', error);
    throw error;
  }

  return data as any[]; // Type assertion will be handled by the context
};

/**
 * Create a new skill
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
  console.log('[skillsService.createSkill] Attempting to insert skill with data:', {
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
    request_type: mode,
    user_id: userId,
    neighborhood_id: neighborhoodId,
    skill_category: formData.category,
    valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    availability: formData.availability || null,
    time_preferences: formData.timePreference || null
  };

  // Log the exact SQL payload for debugging
  console.log('[skillsService.createSkill] Insert payload:', JSON.stringify(insertData, null, 2));

  try {
    const { error, data } = await supabase.from('skills_exchange').insert(insertData).select();

    if (error) {
      // Detailed error logging
      console.error('[skillsService.createSkill] Error creating skill:', {
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
    console.log('[skillsService.createSkill] Skill created successfully:', {
      skillId: data?.[0]?.id,
      title: formData.title,
      userId,
      timestamp: new Date().toISOString()
    });

    return data;
  } catch (error) {
    console.error('[skillsService.createSkill] Unexpected error:', error);
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
  console.log('[skillsService.updateSkill] Attempting to update skill:', {
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
    console.error('[skillsService.updateSkill] Error updating skill:', {
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

  console.log('[skillsService.updateSkill] Skill updated successfully:', {
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
  console.log('[skillsService.deleteSkill] Attempting to delete skill:', {
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
    console.error('[skillsService.deleteSkill] Error deleting skill:', {
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

  console.log('[skillsService.deleteSkill] Skill deleted successfully:', {
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
    console.error('Error checking for duplicates:', error);
    throw error;
  }

  return data;
};
