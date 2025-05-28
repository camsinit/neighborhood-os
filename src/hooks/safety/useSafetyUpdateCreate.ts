
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { SafetyUpdateFormData } from "@/components/safety/schema/safetyUpdateSchema";
import { refreshEvents } from "@/utils/refreshEvents";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this hook
const logger = createLogger('useSafetyUpdateCreate');

/**
 * Hook for creating new safety updates
 * Now works with the cleaned-up database triggers that prevent duplicate activities
 */
export const useSafetyUpdateCreate = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const user = useUser();
  const queryClient = useQueryClient();
  const neighborhood = useCurrentNeighborhood();

  /**
   * Create a new safety update
   * Database triggers automatically handle activity and notification creation
   */
  const createSafetyUpdate = async (formData: SafetyUpdateFormData) => {
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
      
      // Log the operation for debugging
      logger.debug("Creating safety update with cleaned database triggers:", {
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
      logger.info("Safety update created successfully:", {
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
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      logger.debug("Safety update creation completed successfully");
      
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

  return { 
    createSafetyUpdate, 
    isLoading, 
    error 
  };
};
