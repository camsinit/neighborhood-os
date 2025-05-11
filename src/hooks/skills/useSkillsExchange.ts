
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { SkillFormData } from "@/components/skills/types/skillFormTypes";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { refreshEvents } from "@/utils/refreshEvents"; // Import for activity refresh

interface SkillsExchangeProps {
  onSuccess: () => void;
}

/**
 * Custom hook for submitting skills exchange requests and offers
 * 
 * Fixed: removed reference to non-existent event_id field
 */
export const useSkillsExchange = ({ onSuccess }: SkillsExchangeProps) => {
  // Get current user, query client, and neighborhood context
  const user = useUser();
  const queryClient = useQueryClient();
  const neighborhood = useCurrentNeighborhood();

  const handleSubmit = async (formData: Partial<SkillFormData>, mode: 'offer' | 'request') => {
    // Validate required data
    if (!user) {
      toast.error("You must be logged in to create a skill exchange");
      return;
    }

    // Check if we have a neighborhood ID
    if (!neighborhood?.id) {
      toast.error("You must be part of a neighborhood to create a skill exchange");
      return;
    }

    if (!formData.title) {
      toast.error("Title is required");
      return;
    }

    try {
      // Format the data according to the database schema requirements
      // FIXED: Removed any reference to event_id which doesn't exist in the table
      const formattedData = {
        title: formData.title, // Required field
        description: formData.description || null,
        request_type: mode === 'offer' ? 'offer' : 'need',
        user_id: user.id,
        neighborhood_id: neighborhood.id, // Use neighborhood.id (string) instead of the whole object
        skill_category: formData.category || 'technology', // Required field, provide default
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        availability: formData.availability || null,
        time_preferences: formData.timePreference || []
      };

      // Add detailed logging before insert operation
      console.log("[useSkillsExchange] Attempting to insert skill exchange:", {
        userId: user.id,
        neighborhoodId: neighborhood.id,
        mode,
        formData: { ...formattedData, description: formattedData.description?.substring(0, 20) + '...' },
        timestamp: new Date().toISOString()
      });

      const { error, data } = await supabase
        .from('skills_exchange')
        .insert(formattedData)
        .select();

      if (error) {
        // Log detailed error information
        console.error("[useSkillsExchange] Error inserting skill exchange:", {
          error: {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          },
          userId: user.id,
          neighborhoodId: neighborhood.id,
          mode,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      // Log success information including the new skill_id for reference
      if (data && data[0]) {
        console.log("[useSkillsExchange] Skill exchange created successfully:", {
          skillId: data[0].id,
          skill_id: data[0].skill_id, // Access the new redundant ID
          userId: user.id,
          neighborhoodId: neighborhood.id,
          mode,
          timestamp: new Date().toISOString()
        });
      }

      // Update UI and show success message
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      
      // Dispatch refresh event for activities feed
      refreshEvents.skills();
      
      toast.success(mode === 'offer' ? 'Skill offered successfully!' : 'Skill request submitted successfully!');
      onSuccess();
      
      return data;
    } catch (error) {
      console.error('Error creating skill exchange:', error);
      toast.error("Failed to create skill exchange. Please try again.");
      throw error;
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
      // Add detailed logging before update operation
      console.log("[useSkillsExchange] Attempting to update skill exchange:", {
        skillId,
        userId: user.id,
        mode,
        formData: { ...formData, description: formData.description?.substring(0, 20) + '...' },
        timestamp: new Date().toISOString()
      });

      const { error, data } = await supabase
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
        .eq('user_id', user.id)
        .select();

      if (error) {
        // Log detailed error information
        console.error("[useSkillsExchange] Error updating skill exchange:", {
          error: {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          },
          skillId,
          userId: user.id,
          mode,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      // Log success information including the skill_id
      if (data && data[0]) {
        console.log("[useSkillsExchange] Skill exchange updated successfully:", {
          skillId,
          skill_id: data[0].skill_id, // Accessing the redundant ID
          userId: user.id,
          mode,
          timestamp: new Date().toISOString()
        });
      }

      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      
      // Dispatch refresh event for activities feed
      refreshEvents.skills();
      
      toast.success('Skill exchange updated successfully!');
      onSuccess();
      
      return data;
    } catch (error) {
      console.error('Error updating skill exchange:', error);
      toast.error("Failed to update skill exchange. Please try again.");
      throw error;
    }
  };

  return { handleSubmit, handleUpdate };
};
