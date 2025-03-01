
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface SupportRequestSubmitProps {
  onSuccess: () => void;
}

export const useSupportRequestSubmit = ({ onSuccess }: SupportRequestSubmitProps) => {
  const user = useUser();
  const queryClient = useQueryClient();

  const handleSubmit = async (formData) => {
    if (!user) {
      toast.error("You must be logged in to create a support request");
      return;
    }

    try {
      // Format the data for submission
      const formattedData = {
        title: formData.title,
        description: formData.description,
        request_type: formData.requestType,
        category: formData.category,
        user_id: user.id,
        urgency: formData.urgency || 'normal',
        location: formData.location || null,
        image_url: formData.imageUrl || null,
      };

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
      const customEvent = new Event(eventName);
      document.dispatchEvent(customEvent);
      
      onSuccess();
    } catch (error) {
      console.error('Error creating support request:', error);
      toast.error("Failed to create support request. Please try again.");
    }
  };

  return { handleSubmit };
};
