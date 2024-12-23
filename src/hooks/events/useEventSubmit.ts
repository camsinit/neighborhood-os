import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";

interface EventSubmitProps {
  onSuccess: () => void;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
}

export const useEventSubmit = ({ onSuccess }: EventSubmitProps) => {
  const user = useUser();
  const { toast } = useToast();

  const handleSubmit = async (formData: EventFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create an event",
        variant: "destructive",
      });
      return;
    }

    try {
      const timestamp = new Date(`${formData.date}T${formData.time}`).toISOString();

      const { error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          time: timestamp,
          location: formData.location,
          host_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handleSubmit };
};