
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CareRequestFormData } from '../schemas/careRequestSchema';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '@/contexts/neighborhood/types';
import { refreshEvents } from '@/utils/refreshEvents';

/**
 * Custom hook for handling care request form submissions
 * 
 * This hook encapsulates the logic for creating and updating care requests
 */
export const useCareRequestSubmit = (
  user: User | null,
  neighborhoodData: Neighborhood | null,
  onClose: () => void,
  editMode = false,
  existingRequest: any = null
) => {
  // Track submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Submit form data to create or update a care request
   */
  const submitCareRequest = async (data: CareRequestFormData) => {
    // Validate prerequisites
    if (!user || !neighborhoodData) {
      toast.error("You must be logged in and part of a neighborhood to create a care request");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the request data object
      const requestData = {
        title: data.title,
        description: data.description || '',
        request_type: data.requestType,
        care_category: data.careCategory,
        valid_until: data.validUntil.toISOString(),
        user_id: user.id,
        neighborhood_id: neighborhoodData.id,
        support_type: 'care', // This is the "care" support type
      };

      let response;
      let action = 'create';

      // Update existing or create new based on mode
      if (editMode && existingRequest) {
        action = 'update';
        // Update existing care request
        response = await supabase
          .from('care_requests')
          .update(requestData)
          .eq('id', existingRequest.id);
      } else {
        // Create new care request
        response = await supabase
          .from('care_requests')
          .insert(requestData)
          .select();
      }

      if (response.error) {
        throw response.error;
      }

      // Call the edge function to update activities
      const newRequestId = editMode ? existingRequest.id : response.data?.[0]?.id;
      if (newRequestId) {
        // Call our edge function to handle activity feed updates
        const { error: edgeFunctionError } = await supabase.functions.invoke(
          'notify-care-changes', {
          body: {
            careRequestId: newRequestId,
            action: action,
            careRequestTitle: data.title,
            userId: user.id,
            requestType: data.requestType,
            neighborhoodId: neighborhoodData.id,
            changes: data.description
          }
        });

        if (edgeFunctionError) {
          console.error("Error calling edge function:", edgeFunctionError);
        }
      }

      // Show success message
      toast.success(
        editMode
          ? "Care request updated successfully"
          : "Care request created successfully"
      );

      // Trigger the refresh of activities
      refreshEvents.care();

      // Close the form
      onClose();
      
      return true;
    } catch (error) {
      console.error("Error submitting care request:", error);
      toast.error("Failed to save care request");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitCareRequest
  };
};
