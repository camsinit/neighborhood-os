
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { useState } from "react"; // Added import for useState

// Interface for the hook properties
// Make onSuccess optional to allow the hook to be used without a callback
interface SafetyUpdateSubmitProps {
  onSuccess?: () => void;
}

// Interface for the form data
interface SafetyUpdateFormData {
  title: string;
  description: string;
  type: string;
  id?: string; // Optional id for updates
}

// Update the hook to accept an optional parameter
export const useSafetyUpdateSubmit = (props?: SafetyUpdateSubmitProps) => {
  // Fixed variable naming: renamed the state setter to setIsLoading
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
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
      setError(null);
      
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
        setError(error);
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
      
      // Call onSuccess if provided
      if (props?.onSuccess) {
        props.onSuccess();
      }
      
      return data;
    } catch (err) {
      console.error('Error creating safety update:', err);
      toast.error("Failed to create safety update. Please try again.");
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
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
      setError(null);
      
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
        setError(error);
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
      
      // Call onSuccess if provided
      if (props?.onSuccess) {
        props.onSuccess();
      }
      
      return data;
    } catch (err) {
      console.error('Error updating safety update:', err);
      toast.error("Failed to update safety update. Please try again.");
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      // Make sure to set loading to false when done
      setIsLoading(false);
    }
  };

  // Unified safety update submitSafetyUpdate function that works for both create and update
  const submitSafetyUpdate = (data: SafetyUpdateFormData) => {
    if (data.id) {
      return handleUpdate(data.id, data);
    } else {
      return handleSubmit(data);
    }
  };

  // Return isLoading state along with the handleSubmit and handleUpdate functions
  // Also include the submitSafetyUpdate function and error state for compatibility
  return { handleSubmit, handleUpdate, submitSafetyUpdate, isLoading, error };
};
