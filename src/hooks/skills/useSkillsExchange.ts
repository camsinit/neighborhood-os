
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { SkillFormData } from "@/components/skills/types/skillFormTypes";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";

interface SkillsExchangeProps {
  onSuccess: () => void;
}

/**
 * Custom hook for submitting skills exchange requests and offers
 * 
 * This hook handles creating, updating, and managing skills
 * in the skills_exchange table with proper neighborhood assignment.
 */
export const useSkillsExchange = ({ onSuccess }: SkillsExchangeProps) => {
  // Get current user, query client for cache invalidation, and current neighborhood
  const user = useUser();
  const queryClient = useQueryClient();
  const neighborhoodId = useCurrentNeighborhood();

  /**
   * Handle form submission for creating new skill exchange
   * @param formData - The form data from the skill form
   * @param mode - Whether this is an offer or request
   */
  const handleSubmit = async (formData: Partial<SkillFormData>, mode: 'offer' | 'request') => {
    // Verify user is logged in
    if (!user) {
      toast.error("You must be logged in to create a skill exchange");
      return;
    }

    try {
      // Format the data for the database insertion
      // Note: We map 'category' to 'skill_category' to match the database schema
      const formattedData = {
        ...formData,
        request_type: mode === 'offer' ? 'offer' : 'need',
        user_id: user.id,
        neighborhood_id: neighborhoodId,
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        skill_category: formData.category, // Map category to skill_category field
        time_preferences: formData.timePreference || [], // Map timePreference to time_preferences field
      };

      // Send the data to Supabase
      const { error } = await supabase
        .from('skills_exchange')
        .insert(formattedData);

      if (error) throw error;

      // Update the UI after successful submission
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      toast.success(mode === 'offer' ? 'Skill offered successfully!' : 'Skill request submitted successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating skill exchange:', error);
      toast.error("Failed to create skill exchange. Please try again.");
    }
  };

  /**
   * Handle updating an existing skill exchange
   * @param skillId - The ID of the skill to update
   * @param formData - The form data with the updated values
   * @param mode - Whether this is an offer or request
   */
  const handleUpdate = async (skillId: string, formData: Partial<SkillFormData>, mode: 'offer' | 'request') => {
    if (!user) {
      toast.error("You must be logged in to update a skill exchange");
      return;
    }

    try {
      // Update the skill in the database
      const { error } = await supabase
        .from('skills_exchange')
        .update({
          title: formData.title,
          description: formData.description,
          request_type: mode === 'offer' ? 'offer' : 'need',
          skill_category: formData.category, // Use the category field as skill_category
          availability: formData.availability || null,
          time_preferences: formData.timePreference || [],
        })
        .eq('id', skillId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update the UI after successful update
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      toast.success('Skill exchange updated successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error updating skill exchange:', error);
      toast.error("Failed to update skill exchange. Please try again.");
    }
  };

  return { handleSubmit, handleUpdate };
};
