
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
 */
export const useSkillsExchange = ({ onSuccess }: SkillsExchangeProps) => {
  // Get current user, query client, and neighborhood context
  const user = useUser();
  const queryClient = useQueryClient();
  const neighborhoodId = useCurrentNeighborhood();

  const handleSubmit = async (formData: Partial<SkillFormData>, mode: 'offer' | 'request') => {
    // Validate required data
    if (!user) {
      toast.error("You must be logged in to create a skill exchange");
      return;
    }

    if (!formData.title) {
      toast.error("Title is required");
      return;
    }

    try {
      // Format the data according to the database schema requirements
      const formattedData = {
        title: formData.title, // Required field
        description: formData.description || null,
        request_type: mode === 'offer' ? 'offer' : 'need',
        user_id: user.id,
        neighborhood_id: neighborhoodId,
        skill_category: formData.category || 'technology', // Required field, provide default
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        availability: formData.availability || null,
        time_preferences: formData.timePreference || []
      };

      const { error } = await supabase
        .from('skills_exchange')
        .insert(formattedData);

      if (error) throw error;

      // Update UI and show success message
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      toast.success(mode === 'offer' ? 'Skill offered successfully!' : 'Skill request submitted successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating skill exchange:', error);
      toast.error("Failed to create skill exchange. Please try again.");
    }
  };

  const handleUpdate = async (skillId: string, formData: Partial<SkillFormData>, mode: 'offer' | 'request') => {
    if (!user) {
      toast.error("You must be logged in to update a skill exchange");
      return;
    }

    if (!formData.title) {
      toast.error("Title is required");
      return;
    }

    try {
      const { error } = await supabase
        .from('skills_exchange')
        .update({
          title: formData.title,
          description: formData.description || null,
          request_type: mode === 'offer' ? 'offer' : 'need',
          skill_category: formData.category || 'technology',
          availability: formData.availability || null,
          time_preferences: formData.timePreference || []
        })
        .eq('id', skillId)
        .eq('user_id', user.id);

      if (error) throw error;

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
