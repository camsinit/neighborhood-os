
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface SupportRequestSubmitProps {
  onSuccess: () => void;
}

/**
 * Custom hook for handling submission and updates of support requests
 * 
 * This hook provides two main functions:
 * - handleSubmit: For creating new support requests
 * - handleUpdate: For updating existing support requests
 * 
 * Both functions handle validation, database operations, and 
 * triggering UI updates after successful operations
 * 
 * @param onSuccess - Callback function to execute after successful operations
 * @returns Object containing submission handler functions
 */
export const useSupportRequestSubmit = ({ onSuccess }: SupportRequestSubmitProps) => {
  // Get current user and query client for cache invalidation
  const user = useUser();
  const queryClient = useQueryClient();

  /**
   * Handles the submission of a new support request
   * @param formData - The form data containing request details
   * @returns Promise<void>
   */
  const handleSubmit = async (formData: any) => {
    // Check if user is logged in
    if (!user) {
      toast.error("You must be logged in to create a support request");
      return;
    }

    try {
      // Format the data for submission with required fields
      const formattedData = {
        title: formData.title,
        description: formData.description,
        request_type: formData.requestType,
        category: formData.category,
        user_id: user.id,
        // CRITICAL: These fields are required by the database
        support_type: formData.supportType || 'immediate',
        valid_until: formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        // Optional fields
        urgency: formData.urgency || 'normal',
        location: formData.location || null,
        image_url: formData.imageUrl || null,
        skill_category: formData.skill_category || null,
        care_category: formData.care_category || null,
      };

      // Insert the formatted data into the support_requests table
      const { error } = await supabase
        .from('support_requests')
        .insert(formattedData);

      if (error) throw error;

      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      toast.success("Support request created successfully!");
      
      // Dispatch a custom event to signal that a support request was submitted
      // The event name varies depending on the category (care, goods, etc.)
      const eventName = `${formData.category}-request-submitted`;
      console.log(`Dispatching event: ${eventName}`); // Add logging to help debug
      const customEvent = new Event(eventName);
      document.dispatchEvent(customEvent);
      
      // Call the onSuccess callback
      onSuccess();
    } catch (error) {
      console.error('Error creating support request:', error);
      toast.error("Failed to create support request. Please try again.");
    }
  };

  /**
   * Handles updating an existing support request
   * @param requestId - ID of the request to update
   * @param formData - The updated form data
   * @returns Promise<void>
   */
  const handleUpdate = async (requestId: string, formData: any) => {
    // Check if user is logged in
    if (!user) {
      toast.error("You must be logged in to update a support request");
      return;
    }

    try {
      // Format the data for update with required fields
      const formattedData = {
        title: formData.title,
        description: formData.description,
        request_type: formData.requestType,
        category: formData.category,
        // Include support_type which is required
        support_type: formData.supportType || 'immediate',
        // Include valid_until which is required
        valid_until: formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        // Optional fields
        urgency: formData.urgency || null,
        location: formData.location || null,
        image_url: formData.imageUrl || null,
        skill_category: formData.skill_category || null,
        care_category: formData.care_category || null,
      };

      // Update the existing record
      const { error } = await supabase
        .from('support_requests')
        .update(formattedData)
        .eq('id', requestId);

      if (error) throw error;

      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      toast.success("Support request updated successfully!");
      
      // Dispatch a custom event to signal that a support request was updated
      const eventName = `${formData.category}-request-updated`;
      console.log(`Dispatching event: ${eventName}`); // Add logging to help debug
      const customEvent = new Event(eventName);
      document.dispatchEvent(customEvent);
      
      // Call the onSuccess callback
      onSuccess();
    } catch (error) {
      console.error('Error updating support request:', error);
      toast.error("Failed to update support request. Please try again.");
    }
  };

  // Return both functions from the hook
  return { handleSubmit, handleUpdate };
};
