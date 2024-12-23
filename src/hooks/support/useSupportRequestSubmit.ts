import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface SupportRequestSubmitProps {
  onSuccess: () => void;
}

interface SupportRequestFormData {
  title: string;
  description: string;
  type: string;
  validUntil: string;
  requestType: "need" | "offer";
  imageUrl?: string | null;
}

export const useSupportRequestSubmit = ({ onSuccess }: SupportRequestSubmitProps) => {
  const user = useUser();
  const queryClient = useQueryClient();

  const handleSubmit = async (formData: SupportRequestFormData) => {
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
          type: formData.type,
          request_type: formData.requestType,
          user_id: user.id,
          valid_until: new Date(formData.validUntil).toISOString(),
          image_url: formData.imageUrl,
        });

      if (error) throw error;

      toast.success("Support request created successfully");
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      onSuccess();
    } catch (error) {
      console.error('Error creating support request:', error);
      toast.error("Failed to create support request. Please try again.");
    }
  };

  const handleUpdate = async (requestId: string, formData: SupportRequestFormData) => {
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
          type: formData.type,
          request_type: formData.requestType,
          valid_until: new Date(formData.validUntil).toISOString(),
          image_url: formData.imageUrl,
        })
        .eq('id', requestId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Support request updated successfully");
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      onSuccess();
    } catch (error) {
      console.error('Error updating support request:', error);
      toast.error("Failed to update support request. Please try again.");
    }
  };

  return { handleSubmit, handleUpdate };
};