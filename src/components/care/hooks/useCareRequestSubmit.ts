
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
 * This hook encapsulates the logic for creating, updating, and deleting care requests
 * 
 * @param user - The current authenticated user
 * @param neighborhoodData - The current neighborhood data
 * @param onClose - Function to call when submission is complete
 * @param editMode - Whether we're editing an existing request
 * @param existingRequest - The existing request data if in edit mode
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
   * Call the edge function to update the activity feed
   */
  const notifyCareChanges = async (
    careRequestId: string,
    action: 'create' | 'update' | 'delete' | 'confirm',
    careRequestTitle: string, 
    userId: string,
    neighborhoodId: string,
    changes?: string
  ) => {
    try {
      // Call our edge function to handle activity feed updates
      const { error: edgeFunctionError } = await supabase.functions.invoke(
        'notify-care-changes',
        {
          body: {
            careRequestId,
            action,
            careRequestTitle,
            userId,
            neighborhoodId,
            changes
          }
        }
      );

      if (edgeFunctionError) {
        console.error("[useCareRequestSubmit] Error calling edge function:", edgeFunctionError);
        // We don't throw the error here to avoid blocking the main operation
      } else {
        console.log(`[useCareRequestSubmit] Successfully notified about ${action} action for care request ID: ${careRequestId}`);
      }
    } catch (error) {
      console.error("[useCareRequestSubmit] Exception in edge function call:", error);
      // Again, we don't throw to avoid blocking the main operation
    }
  };

  /**
   * Submit form data to create or update a care request
   */
  const submitCareRequest = async (data: CareRequestFormData) => {
    // Validate prerequisites
    if (!user) {
      toast.error("You must be logged in to create a care request");
      return false;
    }

    if (!neighborhoodData?.id) {
      toast.error("You must be part of a neighborhood to create a care request");
      return false;
    }

    setIsSubmitting(true);

    try {
      // Prepare the request data object
      const requestData = {
        title: data.title,
        description: data.description || '',
        request_type: 'need', // Default to 'need' since we removed the field
        care_category: data.careCategory,
        valid_until: data.validUntil.toISOString(),
        user_id: user.id,
        neighborhood_id: neighborhoodData.id,
        support_type: 'care', // This is the "care" support type
      };

      let response;
      let action: 'create' | 'update' = 'create';

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
        await notifyCareChanges(
          newRequestId,
          action,
          data.title,
          user.id,
          neighborhoodData.id,
          data.description
        );
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
      console.error("[useCareRequestSubmit] Error submitting care request:", error);
      toast.error("Failed to save care request");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Delete an existing care request 
   */
  const deleteCareRequest = async (requestId: string, title: string) => {
    if (!user || !neighborhoodData?.id) {
      toast.error("You must be logged in and part of a neighborhood to delete a care request");
      return false;
    }

    setIsSubmitting(true);

    try {
      // Delete the care request
      const { error } = await supabase
        .from('care_requests')
        .delete()
        .eq('id', requestId)
        .eq('user_id', user.id); // Only allow deleting your own requests

      if (error) {
        throw error;
      }

      // Notify the edge function about the deletion
      await notifyCareChanges(
        requestId,
        'delete',
        title,
        user.id,
        neighborhoodData.id
      );

      toast.success("Care request deleted successfully");
      refreshEvents.care();
      onClose();
      return true;
    } catch (error) {
      console.error("[useCareRequestSubmit] Error deleting care request:", error);
      toast.error("Failed to delete care request");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitCareRequest,
    deleteCareRequest
  };
};
