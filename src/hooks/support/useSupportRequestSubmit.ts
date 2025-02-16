
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { SupportRequestFormData } from "@/components/support/types/formTypes";

interface SupportRequestSubmitProps {
  onSuccess: () => void;
}

export const useSupportRequestSubmit = ({ onSuccess }: SupportRequestSubmitProps) => {
  const user = useUser();
  const queryClient = useQueryClient();

  const handleSubmit = async (formData: Partial<SupportRequestFormData>) => {
    if (!user) {
      toast.error("You must be logged in to create a support request");
      return;
    }

    try {
      const { error } = await supabase
        .from('support_requests')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          request_type: formData.requestType,
          support_type: formData.supportType,
          user_id: user.id,
          valid_until: new Date(formData.validUntil!).toISOString(),
          image_url: formData.imageUrl,
          skill_category: formData.skill_category,
        });

      if (error) throw error;

      // Let the parent component handle success messages
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      onSuccess();
    } catch (error) {
      console.error('Error creating support request:', error);
      toast.error("Failed to create support request. Please try again.");
    }
  };

  const handleUpdate = async (requestId: string, formData: Partial<SupportRequestFormData>) => {
    if (!user) {
      toast.error("You must be logged in to update a support request");
      return;
    }

    try {
      const { error } = await supabase
        .from('support_requests')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          request_type: formData.requestType,
          support_type: formData.supportType,
          valid_until: new Date(formData.validUntil!).toISOString(),
          image_url: formData.imageUrl,
          skill_category: formData.skill_category,
        })
        .eq('id', requestId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Let the parent component handle success messages
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      onSuccess();
    } catch (error) {
      console.error('Error updating support request:', error);
      toast.error("Failed to update support request. Please try again.");
    }
  };

  return { handleSubmit, handleUpdate };
};
