
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SafetyUpdateFormData } from '../schema/safetyUpdateSchema';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '@/contexts/neighborhood/types';
import { refreshEvents } from '@/utils/refreshEvents';
import { createLogger } from '@/utils/logger';

// Create a logger instance
const logger = createLogger('useSafetyUpdateFormSubmit');

/**
 * Custom hook for handling community update form submissions
 * Uses database triggers exclusively for notifications
 */
export const useSafetyUpdateFormSubmit = (
  user: User | null,
  neighborhoodData: Neighborhood | null,
  onClose: () => void,
  mode = 'create',
  updateId: string | undefined = undefined
) => {
  // Track submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Submit form data to create or update a community update
   */
  const submitSafetyUpdate = async (data: SafetyUpdateFormData) => {
    // Validate prerequisites
    if (!user) {
      toast.error("You must be logged in to create a community update");
      return false;
    }

    if (!neighborhoodData || !neighborhoodData.id) {
      toast.error("You must be part of a neighborhood to create a community update");
      return false;
    }

    setIsSubmitting(true);

    try {
      // Prepare the update data object
      const updateData = {
        title: data.title,
        description: data.description,
        type: data.type,
        author_id: user.id,
        neighborhood_id: neighborhoodData.id,
      };

      let response;

      // Update existing or create new based on mode
      if (mode === 'edit' && updateId) {
        logger.debug('Updating community update - DB trigger will handle notification', { 
          updateId,
          title: data.title
        });
        
        // Update existing update
        response = await supabase
          .from('safety_updates')
          .update({
            title: data.title,
            description: data.description,
            type: data.type
          })
          .eq('id', updateId);
      } else {
        logger.debug('Creating community update - DB trigger will handle notification', { 
          title: data.title,
          neighborhoodId: neighborhoodData.id
        });
        
        // Create new update
        response = await supabase
          .from('safety_updates')
          .insert(updateData);
      }

      if (response.error) {
        throw response.error;
      }

      // Show success message
      toast.success(
        mode === 'edit'
          ? "Community update edited successfully"
          : "Community update created successfully"
      );

      // Trigger UI refreshes
      refreshEvents.emit('safety-updated');
      refreshEvents.emit('notification-created');
      refreshEvents.emit('activities');

      // Close the form
      onClose();
      
      return true;
    } catch (error) {
      logger.error("Error submitting community update:", error);
      toast.error("Failed to save community update");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitSafetyUpdate
  };
};
