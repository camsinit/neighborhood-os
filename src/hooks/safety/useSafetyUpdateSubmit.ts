
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { useState } from "react"; // Added import for useState

// Interface for the hook properties
interface SafetyUpdateSubmitProps {
  onSuccess: () => void;
}

// Interface for the form data
interface SafetyUpdateFormData {
  title: string;
  description: string;
  type: string;
}

export const useSafetyUpdateSubmit = ({ onSuccess }: SafetyUpdateSubmitProps) => {
  // Fixed variable naming: renamed the state setter to setIsLoading
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const user = useUser();
  const queryClient = useQueryClient();
  const neighborhoodId = useCurrentNeighborhood();

  const handleSubmit = async (formData: SafetyUpdateFormData) => {
    if (!user) {
      toast.error("You must be logged in to create a safety update");
      return;
    }

    try {
      // Set loading to true before starting the operation
      setIsLoading(true);
      
      // Add detailed logging before insert operation
      console.log("[useSafetyUpdateSubmit] Attempting to insert safety update:", {
        userId: user.id,
        neighborhoodId,
        formData: { ...formData, description: formData.description?.substring(0, 20) + '...' },
        timestamp: new Date().toISOString()
      });

      const { error, data } = await supabase
        .from('safety_updates')
        .insert({
          ...formData,
          author_id: user.id,
          neighborhood_id: neighborhoodId
        })
        .select();

      if (error) {
        // Log detailed error information
        console.error("[useSafetyUpdateSubmit] Error inserting safety update:", {
          error: {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          },
          userId: user.id,
          neighborhoodId,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      // Log success information
      console.log("[useSafetyUpdateSubmit] Safety update created successfully:", {
        updateId: data?.[0]?.id,
        userId: user.id,
        neighborhoodId,
        timestamp: new Date().toISOString()
      });

      toast.success("Safety update created successfully");
      
      // Invalidate the safety-updates query
      queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
      
      // Dispatch a custom event to signal that the update was submitted
      // This will trigger a data refresh in the SafetyUpdates component
      const customEvent = new Event('safety-update-submitted');
      document.dispatchEvent(customEvent);
      
      onSuccess();
      
      return data;
    } catch (error) {
      console.error('Error creating safety update:', error);
      toast.error("Failed to create safety update. Please try again.");
      throw error;
    } finally {
      // Make sure to set loading to false when done
      setIsLoading(false);
    }
  };

  const handleUpdate = async (updateId: string, formData: SafetyUpdateFormData) => {
    if (!user) {
      toast.error("You must be logged in to update a safety update");
      return;
    }

    try {
      // Set loading to true before starting the operation
      setIsLoading(true);
      
      // Add detailed logging before update operation
      console.log("[useSafetyUpdateSubmit] Attempting to update safety update:", {
        updateId,
        userId: user.id,
        formData: { ...formData, description: formData.description?.substring(0, 20) + '...' },
        timestamp: new Date().toISOString()
      });

      const { error, data } = await supabase
        .from('safety_updates')
        .update({
          title: formData.title,
          description: formData.description,
          type: formData.type,
        })
        .eq('id', updateId)
        .eq('author_id', user.id)
        .select();

      if (error) {
        // Log detailed error information
        console.error("[useSafetyUpdateSubmit] Error updating safety update:", {
          error: {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          },
          updateId,
          userId: user.id,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      // Log success information
      console.log("[useSafetyUpdateSubmit] Safety update updated successfully:", {
        updateId,
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      toast.success("Safety update updated successfully");
      
      // Invalidate the safety-updates query
      queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
      
      // Dispatch a custom event to signal that the update was submitted
      // This will trigger a data refresh in the SafetyUpdates component
      const customEvent = new Event('safety-update-submitted');
      document.dispatchEvent(customEvent);
      
      onSuccess();
      
      return data;
    } catch (error) {
      console.error('Error updating safety update:', error);
      toast.error("Failed to update safety update. Please try again.");
      throw error;
    } finally {
      // Make sure to set loading to false when done
      setIsLoading(false);
    }
  };

  // Return isLoading state along with the handleSubmit and handleUpdate functions
  return { handleSubmit, handleUpdate, isLoading };
};
