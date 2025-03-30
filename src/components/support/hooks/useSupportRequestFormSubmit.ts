
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '@/contexts/neighborhood/types';
import { refreshEvents } from '@/utils/refreshEvents';
import { SupportRequestFormData } from '../types/formTypes';

/**
 * Custom hook for handling support request form submissions
 * 
 * This hook encapsulates the logic for creating and updating support requests
 * in a reusable way similar to the care request submission hook
 */
export const useSupportRequestFormSubmit = (
  user: User | null,
  neighborhoodData: Neighborhood | null,
  onClose: () => void,
  mode = 'create',
  requestId: string | undefined = undefined
) => {
  // Track submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Submit form data to create or update a support request
   */
  const submitSupportRequest = async (formData: SupportRequestFormData) => {
    // Validate prerequisites
    if (!user) {
      toast.error("You must be logged in to create a support request");
      return false;
    }

    if (!neighborhoodData || !neighborhoodData.id) {
      toast.error("You must be part of a neighborhood to create a support request");
      return false;
    }

    setIsSubmitting(true);

    try {
      // Prepare the request data object
      const requestData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        request_type: formData.requestType,
        valid_until: formData.validUntil,
        support_type: formData.supportType,
        user_id: user.id,
        neighborhood_id: neighborhoodData.id,
        image_url: formData.imageUrl,
        // Include additional fields if they exist
        care_category: formData.care_category,
        goods_category: formData.goods_category,
        urgency: formData.urgency,
        skill_category: formData.skill_category,
      };

      let response;
      let action = 'create';

      // Update existing or create new based on mode
      if (mode === 'edit' && requestId) {
        action = 'update';
        // Update existing support request
        response = await supabase
          .from('support_requests')
          .update(requestData)
          .eq('id', requestId);
      } else {
        // Create new support request
        response = await supabase
          .from('support_requests')
          .insert(requestData)
          .select();
      }

      if (response.error) {
        throw response.error;
      }

      // Show success message
      toast.success(
        mode === 'edit'
          ? "Support request updated successfully"
          : "Support request created successfully"
      );

      // Fixed: Use the correct refresh event based on the category
      if (formData.category === 'goods') {
        refreshEvents.goods();
      } else if (formData.category === 'skills') {
        refreshEvents.skills();
      } else if (formData.category === 'care') {
        refreshEvents.care();
      } else {
        // Generic refresh for other types - we don't have a specific "support" event
        // Using a common refresh event instead
        refreshEvents.goods(); // Using goods as a fallback
      }

      // Close the form
      onClose();
      
      return true;
    } catch (error) {
      console.error("Error submitting support request:", error);
      toast.error("Failed to save support request");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitSupportRequest
  };
};
