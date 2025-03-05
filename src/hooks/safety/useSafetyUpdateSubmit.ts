
/**
 * Updated useSafetyUpdateSubmit hook to include neighborhood_id
 */
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useNeighborhood } from "@/hooks/useNeighborhood";

interface SafetyUpdateSubmitProps {
  onSuccess: () => void;
}

interface SafetyUpdateFormData {
  title: string;
  description: string;
  type: string;
}

export const useSafetyUpdateSubmit = ({ onSuccess }: SafetyUpdateSubmitProps) => {
  const user = useUser();
  const queryClient = useQueryClient();
  // Get the current neighborhood
  const { neighborhood } = useNeighborhood();

  const handleSubmit = async (formData: SafetyUpdateFormData) => {
    if (!user) {
      toast.error("You must be logged in to create a safety update");
      return;
    }

    if (!neighborhood?.id) {
      toast.error("You must be in a neighborhood to create a safety update");
      return;
    }

    try {
      const { error, data } = await supabase
        .from('safety_updates')
        .insert({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          author_id: user.id,
          // Add the neighborhood_id
          neighborhood_id: neighborhood.id
        })
        .select();

      if (error) throw error;

      toast.success("Safety update created successfully");
      
      // Invalidate the safety-updates query
      queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
      
      // Dispatch a custom event to signal that the update was submitted
      const customEvent = new Event('safety-update-submitted');
      document.dispatchEvent(customEvent);
      
      onSuccess();
      
      return data;
    } catch (error) {
      console.error('Error creating safety update:', error);
      toast.error("Failed to create safety update. Please try again.");
      throw error;
    }
  };

  const handleUpdate = async (updateId: string, formData: SafetyUpdateFormData) => {
    if (!user) {
      toast.error("You must be logged in to update a safety update");
      return;
    }

    try {
      const { error, data } = await supabase
        .from('safety_updates')
        .update({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          // We don't update neighborhood_id during update
        })
        .eq('id', updateId)
        .eq('author_id', user.id)
        .select();

      if (error) throw error;

      toast.success("Safety update updated successfully");
      
      // Invalidate the safety-updates query
      queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
      
      // Dispatch a custom event to signal that the update was submitted
      const customEvent = new Event('safety-update-submitted');
      document.dispatchEvent(customEvent);
      
      onSuccess();
      
      return data;
    } catch (error) {
      console.error('Error updating safety update:', error);
      toast.error("Failed to update safety update. Please try again.");
      throw error;
    }
  };

  return { handleSubmit, handleUpdate };
};
