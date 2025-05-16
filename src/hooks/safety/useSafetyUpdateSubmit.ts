
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { useState } from "react"; 
import { SafetyUpdateFormData } from "@/components/safety/schema/safetyUpdateSchema";
import { refreshEvents } from "@/utils/refreshEvents";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger
const logger = createLogger('useSafetyUpdateSubmit');

// Interface for the hook properties
interface SafetyUpdateSubmitProps {
  onSuccess?: () => void;
}

/**
 * Custom hook for handling community update submissions
 * 
 * This hook provides methods to create and update community updates
 * with consistent error handling and state management
 * Now using database triggers for notifications
 */
export const useSafetyUpdateSubmit = (props?: SafetyUpdateSubmitProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const user = useUser();
  const queryClient = useQueryClient();
  const neighborhood = useCurrentNeighborhood();

  /**
   * Create a new community update
   */
  const handleSubmit = async (formData: SafetyUpdateFormData) => {
    if (!user) {
      toast.error("You must be logged in to create a community update");
      return;
    }

    // Check that we have a valid neighborhood
    if (!neighborhood || !neighborhood.id) {
      toast.error("You must be part of a neighborhood to create a community update");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Log the operation for debugging
      logger.debug("Creating community update:", {
        userId: user.id,
        neighborhoodId: neighborhood.id,
        formData: { ...formData, description: formData.description?.substring(0, 20) + '...' }
      });

      // Insert the update
      // Database trigger will handle notifications and activities
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
        logger.error("Error:", error);
        setError(error);
        throw error;
      }

      // Success handling
      toast.success("Community update created successfully");
      queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
      
      // Use refreshEvents to signal update
      refreshEvents.emit('safety-updated');
      refreshEvents.emit('notification-created');
      
      // Call onSuccess if provided
      if (props?.onSuccess) {
        props.onSuccess();
      }
      
      logger.debug("Successfully created community update - database trigger handled notifications");
      
      return data;
    } catch (err) {
      logger.error('Error creating community update:', err);
      toast.error("Failed to create community update. Please try again.");
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update an existing community update
   */
  const handleUpdate = async (updateId: string, formData: SafetyUpdateFormData) => {
    if (!user) {
      toast.error("You must be logged in to update a community update");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Log the operation for debugging
      logger.debug("Updating community update:", {
        updateId,
        userId: user.id,
        formData: { ...formData, description: formData.description?.substring(0, 20) + '...' }
      });

      // Update the community update
      // Database trigger will handle notifications and activity updates
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
        logger.error("Error:", error);
        setError(error);
        throw error;
      }

      // Success handling
      toast.success("Community update updated successfully");
      queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
      
      // Use refreshEvents to signal update
      refreshEvents.emit('safety-updated');
      refreshEvents.emit('notification-created');
      
      // Call onSuccess if provided
      if (props?.onSuccess) {
        props.onSuccess();
      }
      
      logger.debug("Successfully updated community update - database trigger handled notifications");
      
      return data;
    } catch (err) {
      logger.error('Error updating community update:', err);
      toast.error("Failed to update community update. Please try again.");
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
