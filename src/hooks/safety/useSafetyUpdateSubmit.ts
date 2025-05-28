
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { useState } from "react"; 
import { SafetyUpdateFormData } from "@/components/safety/schema/safetyUpdateSchema";
import { refreshEvents } from "@/utils/refreshEvents";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for tracking submission process
const logger = createLogger('useSafetyUpdateSubmit');

// Interface for the hook properties
interface SafetyUpdateSubmitProps {
  onSuccess?: () => void;
}

/**
 * Custom hook for handling safety update submissions
 * 
 * This hook provides methods to create and update safety updates
 * with consistent error handling and state management.
 * Now uses the cleaned-up database triggers that prevent duplicate activities.
 */
export const useSafetyUpdateSubmit = (props?: SafetyUpdateSubmitProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const user = useUser();
  const queryClient = useQueryClient();
  const neighborhood = useCurrentNeighborhood();

  /**
   * Create a new safety update
   * The cleaned database triggers now automatically handle:
   * - Creating exactly ONE activity record (no more duplicates!)
   * - Creating notifications for neighborhood members
   */
  const handleSubmit = async (formData: SafetyUpdateFormData) => {
    // Validate user authentication
    if (!user) {
      toast.error("You must be logged in to create a safety update");
      return;
    }

    // Check that we have a valid neighborhood context
    if (!neighborhood || !neighborhood.id) {
      toast.error("You must be part of a neighborhood to create a safety update");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Log the operation for debugging the cleaned trigger behavior
      logger.debug("Creating safety update with cleaned triggers:", {
        userId: user.id,
        neighborhoodId: neighborhood.id,
        title: formData.title,
        type: formData.type,
        hasDescription: !!formData.description
      });

      // Insert the safety update - the cleaned database triggers handle everything else
      const { error, data } = await supabase
        .from('safety_updates')
        .insert({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          author_id: user.id,
          neighborhood_id: neighborhood.id
        })
        .select();

      if (error) {
        logger.error("Database error:", error);
        setError(error);
        throw error;
      }

      // Log successful creation
      logger.info("Safety update created successfully with cleaned triggers:", {
        safetyUpdateId: data?.[0]?.id,
        title: formData.title,
        note: "Cleaned database triggers handle activities and notifications automatically (no duplicates)"
      });

      // Success handling
      toast.success("Safety update created successfully");
      
      // Invalidate queries to refresh the UI with the new data
      queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Use refreshEvents to signal update to auto-refresh components
      refreshEvents.emit('safety-updated');
      refreshEvents.emit('activities');
      
      // Call onSuccess callback if provided
      if (props?.onSuccess) {
        props.onSuccess();
      }
      
      logger.debug("Safety update submission completed successfully with cleaned triggers");
      
      return data;
    } catch (err) {
      logger.error('Error creating safety update:', err);
      toast.error("Failed to create safety update. Please try again.");
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update an existing safety update
   * The cleaned triggers handle activity updates automatically
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
      logger.debug("Updating safety update with cleaned triggers:", {
        updateId,
        userId: user.id,
        title: formData.title,
        type: formData.type
      });

      // Update the safety update - cleaned triggers handle activity updates
      const { error, data } = await supabase
        .from('safety_updates')
        .update({
          title: formData.title,
          description: formData.description,
          type: formData.type,
        })
        .eq('id', updateId)
        .eq('author_id', user.id) // Ensure user can only update their own safety updates
        .select();

      if (error) {
        logger.error("Error updating safety update:", error);
        setError(error);
        throw error;
      }

      // Success handling
      toast.success("Safety update updated successfully");
      queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
      
      // Use refreshEvents to signal update
      refreshEvents.emit('safety-updated');
      
      // Call onSuccess callback if provided
      if (props?.onSuccess) {
        props.onSuccess();
      }
      
      logger.debug("Safety update update completed successfully with cleaned triggers");
      
      return data;
    } catch (err) {
      logger.error('Error updating safety update:', err);
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
