
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { SupportRequestFormData } from "@/components/support/types/formTypes";

/**
 * This hook is used to submit support requests to the support_requests table.
 * 
 * ! DEPRECATED - This hook is only maintained for backward compatibility.
 * ! Each specific feature (goods, skills, etc.) should use its own dedicated submission logic.
 * 
 * @param onSuccess - A callback function to call when the submission is successful
 * @returns - An object with handleSubmit and handleUpdate functions
 */
interface SupportRequestSubmitProps {
  onSuccess: () => void;
}

export const useSupportRequestSubmit = ({ onSuccess }: SupportRequestSubmitProps) => {
  // Get the current user from Supabase authentication
  const user = useUser();
  // Get the query client to invalidate queries after submission
  const queryClient = useQueryClient();

  /**
   * Handles the submission of a new support request
   * 
   * @param formData - The data from the support request form
   */
  const handleSubmit = async (formData: Partial<SupportRequestFormData>) => {
    // Check if the user is logged in
    if (!user) {
      toast.error("You must be logged in to create a support request");
      return;
    }

    try {
      // Insert the support request into the database
      const { error } = await supabase
        .from('support_requests')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          request_type: formData.requestType,
          support_type: formData.supportType,
          user_id: user.id,
          valid_until: formData.validUntil ? new Date(formData.validUntil).toISOString() : undefined,
          image_url: formData.imageUrl,
          skill_category: formData.skill_category,
        });

      if (error) throw error;

      // Invalidate the support-requests query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      // Call the onSuccess callback provided by the parent component
      onSuccess();
    } catch (error) {
      console.error('Error creating support request:', error);
      toast.error("Failed to create support request. Please try again.");
    }
  };

  /**
   * Handles the update of an existing support request
   * 
   * @param requestId - The ID of the support request to update
   * @param formData - The updated data for the support request
   */
  const handleUpdate = async (requestId: string, formData: Partial<SupportRequestFormData>) => {
    // Check if the user is logged in
    if (!user) {
      toast.error("You must be logged in to update a support request");
      return;
    }

    try {
      // Update the support request in the database
      const { error } = await supabase
        .from('support_requests')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          request_type: formData.requestType,
          support_type: formData.supportType,
          valid_until: formData.validUntil ? new Date(formData.validUntil).toISOString() : undefined,
          image_url: formData.imageUrl,
          skill_category: formData.skill_category,
        })
        .eq('id', requestId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Invalidate the support-requests query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      // Call the onSuccess callback provided by the parent component
      onSuccess();
    } catch (error) {
      console.error('Error updating support request:', error);
      toast.error("Failed to update support request. Please try again.");
    }
  };

  return { handleSubmit, handleUpdate };
};
