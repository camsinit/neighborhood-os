import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";

interface SafetyUpdateSubmitProps {
  onSuccess: () => void;
}

interface SafetyUpdateFormData {
  title: string;
  description: string;
  type: string;
}

export const useSafetyUpdateSubmit = ({ onSuccess }: SafetyUpdateSubmitProps) => {
  const user = useUser();
  const { toast } = useToast();

  const handleSubmit = async (formData: SafetyUpdateFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a safety update",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('safety_updates')
        .insert({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          author_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your safety update has been successfully posted.",
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating safety update:', error);
      toast({
        title: "Error",
        description: "Failed to create safety update. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handleSubmit };
};