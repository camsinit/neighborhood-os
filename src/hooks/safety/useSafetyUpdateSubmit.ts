
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

// Interface for the hook properties - supports both old and new usage patterns
interface SafetyUpdateSubmitProps {
  onSuccess?: () => void;
  onClose?: () => void; // Added for backward compatibility
}

/**
 * UNIFIED Custom hook for handling safety update submissions
 * 
 * This is the ONLY hook that should be used for safety update submissions.
 * It handles both create and update operations with consistent error handling
 * and state management. Database triggers automatically handle activity creation.
 */
export const useSafetyUpdateSubmit = (props?: SafetyUpdateSubmitProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Alias for backward compatibility
  const [error, setError] = useState<Error | null>(null);
  const user = useUser();
  const queryClient = useQueryClient();
  const neighborhood = useCurrentNeighborhood();

  /**
   * Create a new safety update
   * Database triggers automatically handle:
   * - Creating exactly ONE activity record
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
      setIsSubmitting(true); // Set both for compatibility
      setError(null);
      
      // Log the operation for debugging
      logger.debug("Creating safety update with database triggers:", {
        userId: user.id,
        neighborhoodId: neighborhood.id,
        title: formData.title,
        type: formData.type,
        hasDescription: !!formData.description
      });

      // Insert the safety update - database triggers handle everything else automatically
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
      logger.info("Safety update created successfully with database triggers:", {
        safetyUpdateId: data?.[0]?.id,
        title: formData.title,
        note: "Database triggers handle activities and notifications automatically"
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
      
      // Call success/close callbacks if provided
      if (props?.onSuccess) {
        props.onSuccess();
      }
      if (props?.onClose) {
        props.onClose();
      }
      
      logger.debug("Safety update submission completed successfully with database triggers");
      
      return data;
    } catch (err) {
      logger.error('Error creating safety update:', err);
      toast.error("Failed to create safety update. Please try again.");
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  /**
   * Update an existing safety update
   * Database triggers handle activity updates automatically
   */
  const handleUpdate = async (updateId: string, formData: SafetyUpdateFormData) => {
    if (!user) {
      toast.error("You must be logged in to update a safety update");
      return;
    }

    try {
      setIsLoading(true);
      setIsSubmitting(true);
      setError(null);
      
      // Log the operation for debugging
      logger.debug("Updating safety update with database triggers:", {
        updateId,
        userId: user.id,
        title: formData.title,
        type: formData.type
      });

      // Update the safety update - database triggers handle activity updates
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
      
      // Call success/close callbacks if provided
      if (props?.onSuccess) {
        props.onSuccess();
      }
      if (props?.onClose) {
        props.onClose();
      }
      
      logger.debug("Safety update update completed successfully with database triggers");
      
      return data;
    } catch (err) {
      logger.error('Error updating safety update:', err);
      toast.error("Failed to update safety update. Please try again.");
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  /**
   * Unified method that works for both create and update operations
   * Provides backward compatibility for both hook interfaces
   */
  const submitSafetyUpdate = (data: SafetyUpdateFormData & { id?: string }) => {
    if (data.id) {
      return handleUpdate(data.id, data);
    } else {
      return handleSubmit(data);
    }
  };

  // Return both old and new interface properties for maximum compatibility
  return { 
    handleSubmit, 
    handleUpdate, 
    submitSafetyUpdate, 
    isLoading, 
    isSubmitting, // Alias for backward compatibility
    error 
  };
};
