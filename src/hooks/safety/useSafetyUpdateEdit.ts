import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { SafetyUpdateFormData } from "@/components/safety/schema/safetyUpdateSchema";
import { unifiedEvents } from '@/utils/unifiedEventSystem';
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this hook
const logger = createLogger('useSafetyUpdateEdit');

/**
 * Hook for editing existing safety updates
 * Works with the cleaned-up database triggers
 */
export const useSafetyUpdateEdit = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const user = useUser();
  const queryClient = useQueryClient();

  /**
   * Update an existing safety update
   * Database triggers handle activity updates automatically
   */
  const updateSafetyUpdate = async (updateId: string, formData: SafetyUpdateFormData) => {
    if (!user) {
      toast.error("You must be logged in to update a safety update");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Log the operation for debugging
      logger.debug("Updating safety update with cleaned database triggers:", {
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
      unifiedEvents.emit('safety-updated');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      logger.debug("Safety update edit completed successfully");
      
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

  return { 
    updateSafetyUpdate, 
    isLoading, 
    error 
  };
};
