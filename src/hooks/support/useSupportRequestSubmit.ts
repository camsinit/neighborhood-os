import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";

interface SupportRequestSubmitProps {
  onSuccess: () => void;
}

interface SupportRequestFormData {
  title: string;
  description: string;
  type: string;
  validUntil: string;
  requestType: "need" | "offer";
}

export const useSupportRequestSubmit = ({ onSuccess }: SupportRequestSubmitProps) => {
  const user = useUser();
  const { toast } = useToast();

  const handleSubmit = async (formData: SupportRequestFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a support request",
        variant: "destructive",
      });
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
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your support request has been successfully posted.",
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating support request:', error);
      toast({
        title: "Error",
        description: "Failed to create support request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handleSubmit };
};