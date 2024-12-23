import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  const handleSubmit = async (formData: SafetyUpdateFormData) => {
    if (!user) {
      toast.error("You must be logged in to create a safety update");
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

      toast.success("Safety update created successfully");
      queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
      onSuccess();
    } catch (error) {
      console.error('Error creating safety update:', error);
      toast.error("Failed to create safety update. Please try again.");
    }
  };

  const handleUpdate = async (updateId: string, formData: SafetyUpdateFormData) => {
    if (!user) {
      toast.error("You must be logged in to update a safety update");
      return;
    }

    try {
      const { error } = await supabase
        .from('safety_updates')
        .update({
          title: formData.title,
          description: formData.description,
          type: formData.type,
        })
        .eq('id', updateId)
        .eq('author_id', user.id);

      if (error) throw error;

      toast.success("Safety update updated successfully");
      queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
      onSuccess();
    } catch (error) {
      console.error('Error updating safety update:', error);
      toast.error("Failed to update safety update. Please try again.");
    }
  };

  return { handleSubmit, handleUpdate };
};