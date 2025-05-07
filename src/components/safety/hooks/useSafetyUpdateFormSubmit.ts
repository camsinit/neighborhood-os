
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SafetyUpdateFormData } from '../schema/safetyUpdateSchema';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '@/contexts/neighborhood/types';
import { refreshEvents } from '@/utils/refreshEvents';

/**
 * Custom hook for handling safety update form submissions
 * 
 * This hook encapsulates the logic for creating and updating safety updates
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
   * Submit form data to create or update a safety update
   */
  const submitSafetyUpdate = async (data: SafetyUpdateFormData) => {
    // Validate prerequisites
    if (!user) {
      toast.error("You must be logged in to create a safety update");
      return false;
    }

    if (!neighborhoodData || !neighborhoodData.id) {
      toast.error("You must be part of a neighborhood to create a safety update");
      return false;
    }

    setIsSubmitting(true);

    try {
      // Prepare the safety update data object - using author_id instead of user_id
      const updateData = {
        title: data.title,
        description: data.description,
        type: data.type,
        author_id: user.id, // Changed from user_id to author_id to match the table schema
        neighborhood_id: neighborhoodData.id,
      };

      let response;
      let action = 'create';

      // Update existing or create new based on mode
      if (mode === 'edit' && updateId) {
        action = 'update';
        // Update existing safety update
        response = await supabase
          .from('safety_updates')
          .update(updateData)
          .eq('id', updateId);
      } else {
        // Create new safety update
        response = await supabase
          .from('safety_updates')
          .insert(updateData)
          .select();
      }

      if (response.error) {
        throw response.error;
      }

      // Call the edge function to update activities
      // Now using safety_update_id for consistency
      let safetyUpdateId: string;
      
      if (mode === 'edit' && updateId) {
        // For updates, we need to fetch the safety_update_id
        const { data: fetchedUpdate, error: fetchError } = await supabase
          .from('safety_updates')
          .select('safety_update_id')
          .eq('id', updateId)
          .single();
          
        if (fetchError) {
          console.error("Error fetching safety_update_id:", fetchError);
          safetyUpdateId = updateId; // Fallback to primary key
        } else {
          safetyUpdateId = fetchedUpdate.safety_update_id;
        }
      } else {
        // For new items, get the safety_update_id from the response
        safetyUpdateId = response.data?.[0]?.safety_update_id || response.data?.[0]?.id;
      }
      
      if (safetyUpdateId) {
        // Call our edge function to handle activity feed updates
        const { error: edgeFunctionError } = await supabase.functions.invoke(
          'notify-safety-changes', {
          body: {
            safetyUpdateId: safetyUpdateId,
            action: action,
            safetyUpdateTitle: data.title,
            userId: user.id,
            neighborhoodId: neighborhoodData.id,
          }
        });

        if (edgeFunctionError) {
          console.error("Error calling edge function:", edgeFunctionError);
        }
      }

      // Show success message
      toast.success(
        mode === 'edit'
          ? "Safety update edited successfully"
          : "Safety update created successfully"
      );

      // Trigger the refresh of activities
      refreshEvents.safety();

      // Close the form
      onClose();
      
      return true;
    } catch (error) {
      console.error("Error submitting safety update:", error);
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
