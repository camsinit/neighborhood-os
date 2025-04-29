
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { useState } from "react"; 
import { SafetyUpdateFormData } from "@/components/safety/schema/safetyUpdateSchema";
import { refreshEvents } from "@/utils/refreshEvents";

// Interface for the hook properties
interface SafetyUpdateSubmitProps {
  onSuccess?: () => void;
}

/**
 * Custom hook for handling safety update submissions
 * 
 * This hook provides methods to create and update safety updates
 * with consistent error handling and state management
 */
export const useSafetyUpdateSubmit = (props?: SafetyUpdateSubmitProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const user = useUser();
  const queryClient = useQueryClient();
  const neighborhood = useCurrentNeighborhood();

  /**
   * Create a new safety update
   */
  const handleSubmit = async (formData: SafetyUpdateFormData) => {
    // Check user authentication
    if (!user) {
      toast.error("You must be logged in to create a safety update");
      return;
    }

    // Check that we have a valid neighborhood
    if (!neighborhood || !neighborhood.id) {
      toast.error("You must be part of a neighborhood to create a safety update");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Log the operation for debugging
      console.log("[useSafetyUpdateSubmit] Creating safety update:", {
        userId: user.id,
        neighborhoodId: neighborhood.id,
        formData: { ...formData, description: formData.description?.substring(0, 20) + '...' }
      });

      // Insert the safety update with author_id (not user_id)
      const { error, data } = await supabase
        .from('safety_updates')
        .insert({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          author_id: user.id, // Use author_id to match table schema
          neighborhood_id: neighborhood.id // Use neighborhood.id (not the whole object)
        })
        .select();

      if (error) {
        console.error("[useSafetyUpdateSubmit] Error:", error);
        setError(error);
        throw error;
      }

      // Call the edge function to handle activity feed updates
      if (data && data.length > 0) {
        const safetyUpdateId = data[0].id;
        
        const { error: edgeFunctionError } = await supabase.functions.invoke(
          'notify-safety-changes', {
          body: {
            safetyUpdateId,
            action: 'update',
            safetyUpdateTitle: formData.title,
            userId: user.id,
            neighborhoodId: neighborhood.id,
          }
        });

        if (edgeFunctionError) {
          console.error("[useSafetyUpdateSubmit] Error calling edge function:", edgeFunctionError);
        }
      }

      // Success handling
      toast.success("Safety update created successfully");
      queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
      
      // Use refreshEvents to signal update
      refreshEvents.safety();
      
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
      setIsLoading(false);
    }
  };

  /**
   * Update an existing safety update
   */
  const handleUpdate = async (updateId: string, formData: SafetyUpdateFormData) => {
    if (!user) {
      toast.error("You must be logged in to update a safety update");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Log the operation for debugging
      console.log("[useSafetyUpdateSubmit] Updating safety update:", {
        updateId,
        userId: user.id,
        formData: { ...formData, description: formData.description?.substring(0, 20) + '...' }
      });

      // Update the safety update
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
        console.error("[useSafetyUpdateSubmit] Error:", error);
        setError(error);
        throw error;
      }

      // Call edge function to update activities
      const { error: edgeFunctionError } = await supabase.functions.invoke(
        'notify-safety-changes', {
        body: {
          safetyUpdateId: updateId,
          action: 'update',
          safetyUpdateTitle: formData.title,
          userId: user.id,
          neighborhoodId: neighborhood?.id,
        }
      });

      if (edgeFunctionError) {
        console.error("[useSafetyUpdateSubmit] Error calling edge function:", edgeFunctionError);
      }

      // Success handling
      toast.success("Safety update updated successfully");
      queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
      
      // Use refreshEvents to signal update
      refreshEvents.safety();
      
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
      setIsLoading(false);
    }
  };

  /**
   * Unified method that works for both create and update operations
   */
  const submitSafetyUpdate = (data: SafetyUpdateFormData & { id?: string }) => {
    if (data.id) {
      return handleUpdate(data.id, data);
    } else {
      return handleSubmit(data);
    }
  };

  return { handleSubmit, handleUpdate, submitSafetyUpdate, isLoading, error };
};
