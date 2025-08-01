
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { SafetyUpdateFormData } from "@/components/safety/schema/safetyUpdateSchema";
import { unifiedEvents } from '@/utils/unifiedEventSystem';
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this hook
const logger = createLogger('useSafetyUpdateCreate');

/**
 * Hook for creating new safety updates
 * Now works with the cleaned-up database triggers that prevent duplicate activities
 * Includes support for image uploads
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
   * Now includes image URL handling
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
      logger.debug("Creating safety update:", {
        userId: user.id,
        neighborhoodId: neighborhood.id,
        title: formData.title,
        type: formData.type,
        hasDescription: !!formData.description,
        hasImage: !!formData.imageUrl
      });

      // Insert the safety update - database triggers handle everything else automatically
      // Now includes the image_url field
      const { error, data } = await supabase
        .from('safety_updates')
        .insert({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          image_url: formData.imageUrl || null, // Include image URL if provided
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
        hasImage: !!formData.imageUrl
      });

      // Success handling
      toast.success("Safety update created successfully");
      
      // Invalidate queries to refresh the UI with the new data
      queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Use unifiedEvents to signal update to auto-refresh components
      unifiedEvents.emit('safety-updated');
      unifiedEvents.emit('activities');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
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
