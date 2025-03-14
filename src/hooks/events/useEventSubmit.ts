import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";

interface EventSubmitProps {
  onSuccess: () => void;
}

export const useEventSubmit = ({ onSuccess }: EventSubmitProps) => {
  const user = useUser();
  const queryClient = useQueryClient();
  const neighborhoodId = useCurrentNeighborhood();

  const handleSubmit = async (formData: any) => {
    if (!user) {
      toast.error("You must be logged in to create an event");
      return;
    }

    try {
      const { error, data } = await supabase
        .from('events')
        .insert({
          ...formData,
          host_id: user.id,
          neighborhood_id: neighborhoodId
        })
        .select();

      if (error) throw error;

      // Success notification
      toast.success("Event created successfully");
      
      // Invalidate the events query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['events'] });
      
      // Dispatch a custom event to signal that an event was created
      // This will trigger a data refresh in components listening for this event
      const customEvent = new Event('event-submitted');
      document.dispatchEvent(customEvent);
      
      onSuccess();
      
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error("Failed to create event. Please try again.");
      throw error;
    }
  };

  const handleUpdate = async (eventId: string, formData: any) => {
    if (!user) {
      toast.error("You must be logged in to update an event");
      return;
    }

    try {
      const { error, data } = await supabase
        .from('events')
        .update({
          title: formData.title,
          description: formData.description,
          time: formData.time,
          location: formData.location,
          is_recurring: formData.isRecurring,
          recurrence_pattern: formData.isRecurring ? formData.recurrencePattern : null,
          recurrence_end_date: formData.isRecurring ? formData.recurrenceEndDate : null,
        })
        .eq('id', eventId)
        .eq('host_id', user.id)
        .select();

      if (error) throw error;

      // Success notification
      toast.success("Event updated successfully");
      
      // Invalidate the events query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['events'] });
      
      // Dispatch a custom event to signal that an event was updated
      // This will trigger a data refresh in components listening for this event
      const customEvent = new Event('event-submitted');
      document.dispatchEvent(customEvent);
      
      onSuccess();
      
      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error("Failed to update event. Please try again.");
      throw error;
    }
  };

  return { handleSubmit, handleUpdate };
};
