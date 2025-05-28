
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SafetyUpdateFormData } from '../schema/safetyUpdateSchema';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '@/contexts/neighborhood/types';
import { refreshEvents } from '@/utils/refreshEvents';
import { createLogger } from '@/utils/logger';

// Create a logger instance for tracking the submission process
const logger = createLogger('useSafetyUpdateFormSubmit');

/**
 * Custom hook for handling safety update form submissions
 * Now uses the cleaned-up database triggers that prevent duplicate activities
 */
export const useSafetyUpdateFormSubmit = (
  user: User | null,
  neighborhoodData: Neighborhood | null,
  onClose: () => void,
  mode = 'create',
  updateId: string | undefined = undefined
) => {
  // Track submission state to show loading indicators
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Submit form data to create or update a safety update
   * The database triggers now handle ALL activity and notification creation automatically
   */
  const submitSafetyUpdate = async (data: SafetyUpdateFormData) => {
    // Validate that we have the required user authentication
    if (!user) {
      toast.error("You must be logged in to create a safety update");
      return false;
    }

    // Validate that we have a valid neighborhood context
    if (!neighborhoodData || !neighborhoodData.id) {
      toast.error("You must be part of a neighborhood to create a safety update");
      return false;
    }

    setIsSubmitting(true);

    try {
      // Prepare the safety update data object with all required fields
      const updateData = {
        title: data.title,
        description: data.description,
        type: data.type,
        author_id: user.id,
        neighborhood_id: neighborhoodData.id,
      };

      let response;

      // Handle both create and update operations
      if (mode === 'edit' && updateId) {
        logger.debug('Updating safety update - cleaned DB triggers handle activity updates', { 
          updateId,
          title: data.title
        });
        
        // Update existing safety update - triggers handle activity updates automatically
        response = await supabase
          .from('safety_updates')
          .update({
            title: data.title,
            description: data.description,
            type: data.type
          })
          .eq('id', updateId);
      } else {
        logger.debug('Creating safety update - cleaned DB triggers handle activity/notification creation', { 
          title: data.title,
          neighborhoodId: neighborhoodData.id
        });
        
        // Create new safety update - the cleaned triggers handle everything automatically
        response = await supabase
          .from('safety_updates')
          .insert(updateData);
      }

      // Check for database errors
      if (response.error) {
        throw response.error;
      }

      // Show success message to the user
      toast.success(
        mode === 'edit'
          ? "Safety update edited successfully"
          : "Safety update created successfully"
      );

      // Trigger UI refreshes to show the new content
      // The database triggers handle all the backend activity/notification creation
      refreshEvents.emit('safety-updated');
      refreshEvents.emit('activities');

      // Close the form dialog
      onClose();
      
      return true;
    } catch (error) {
      logger.error("Error submitting safety update:", error);
      toast.error("Failed to save safety update");
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
