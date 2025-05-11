
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
 * 
 * FIXED: Removed any reference to event_id which doesn't exist in the table
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

  const { error } = await supabase.from('skills_exchange').insert({
    title: formData.title,
    description: formData.description || null,
    request_type: mode,
    user_id: userId,
    neighborhood_id: neighborhoodId,
    skill_category: formData.category,
    valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    availability: formData.availability || null,
    time_preferences: formData.timePreference || null
  });

  if (error) {
    console.error('Error creating skill:', error);
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
  
  // Update the skill
  const { error } = await supabase
    .from('skills_exchange')
    .update(updateData)
    .eq('id', skillId)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error updating skill:', error);
    throw error;
  }
};

/**
 * Delete a skill
 */
export const deleteSkill = async (
  skillId: string,
  skillTitle: string,
  userId: string
) => {
  // Delete the skill
  const { error } = await supabase
    .from('skills_exchange')
    .delete()
    .eq('id', skillId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting skill:', error);
    throw error;
  }
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
