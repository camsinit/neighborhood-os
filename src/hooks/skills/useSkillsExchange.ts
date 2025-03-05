
/**
 * Updated useSkillsExchange hook to include neighborhood_id
 */
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { SkillFormData } from "@/components/skills/types/skillFormTypes";
import { useNeighborhood } from "@/hooks/useNeighborhood";

interface SkillsExchangeProps {
  onSuccess: () => void;
}

export const useSkillsExchange = ({ onSuccess }: SkillsExchangeProps) => {
  const user = useUser();
  const queryClient = useQueryClient();
  // Get the current neighborhood
  const { neighborhood } = useNeighborhood();

  const handleSubmit = async (formData: Partial<SkillFormData>, mode: 'offer' | 'request') => {
    if (!user) {
      toast.error("You must be logged in to create a skill exchange");
      return;
    }

    if (!neighborhood?.id) {
      toast.error("You must be in a neighborhood to create a skill exchange");
      return;
    }

    try {
      // Format the availability data properly
      const formattedData = {
        title: formData.title,
        description: formData.description,
        request_type: mode === 'offer' ? 'offer' : 'need',
        skill_category: formData.category,
        user_id: user.id,
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        availability: formData.availability || null,
        time_preferences: formData.timePreference || [],
        // Add the neighborhood_id
        neighborhood_id: neighborhood.id
      };

      const { error } = await supabase
        .from('skills_exchange')
        .insert(formattedData);

      if (error) throw error;

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

    try {
      const { error } = await supabase
        .from('skills_exchange')
        .update({
          title: formData.title,
          description: formData.description,
          request_type: mode === 'offer' ? 'offer' : 'need',
          skill_category: formData.category,
          availability: formData.availability || null,
          time_preferences: formData.timePreference || [],
          // We don't update neighborhood_id during update
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
