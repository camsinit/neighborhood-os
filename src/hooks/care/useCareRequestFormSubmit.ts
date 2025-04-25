
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CareRequestFormData } from '@/components/care/schemas/careRequestSchema';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '@/contexts/neighborhood/types';
import { refreshEvents } from '@/utils/refreshEvents';

/**
 * Hook for handling care request form submissions
 */
export const useCareRequestFormSubmit = (
  user: User | null,
  neighborhoodData: Neighborhood | null,
  onClose: () => void,
  editMode = false,
  existingRequest: any = null
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        care_category: data.careCategory,
        valid_until: data.validUntil.toISOString(),
        user_id: user.id,
        neighborhood_id: neighborhoodData.id,
        support_type: 'care',
      };

      const { error } = editMode && existingRequest
        ? await updateCareRequest(existingRequest.id, requestData)
        : await createCareRequest(requestData);

      if (error) throw error;

      // Show success message
      toast.success(
        editMode
          ? "Care request updated successfully"
          : "Care request created successfully"
      );

      // Refresh activities and close form
      refreshEvents.care();
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

  return {
    isSubmitting,
    submitCareRequest,
  };
};

// Helper functions for database operations
async function createCareRequest(requestData: any) {
  return await supabase
    .from('care_requests')
    .insert(requestData)
    .select()
    .single();
}

async function updateCareRequest(id: string, requestData: any) {
  return await supabase
    .from('care_requests')
    .update(requestData)
    .eq('id', id)
    .select()
    .single();
}
