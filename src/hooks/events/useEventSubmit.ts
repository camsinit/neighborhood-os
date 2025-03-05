
/**
 * Updated useEventSubmit hook to include neighborhood_id
 */
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useNeighborhood } from "@/hooks/useNeighborhood";

interface EventSubmitProps {
  onSuccess: () => void;
}

export const useEventSubmit = ({ onSuccess }: EventSubmitProps) => {
  const user = useUser();
  const queryClient = useQueryClient();
  // Get the current neighborhood
  const { neighborhood } = useNeighborhood();

  const handleSubmit = async (formData: any) => {
    if (!user) {
      toast.error("You must be logged in to create an event");
      return;
    }

    if (!neighborhood?.id) {
      toast.error("You must be in a neighborhood to create an event");
      return;
    }

    try {
      const { error, data } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          time: formData.time,
          location: formData.location,
          host_id: user.id,
          is_recurring: formData.isRecurring,
          recurrence_pattern: formData.isRecurring ? formData.recurrencePattern : null,
          recurrence_end_date: formData.isRecurring ? formData.recurrenceEndDate : null,
          // Add the neighborhood_id
          neighborhood_id: neighborhood.id
        })
        .select();

      if (error) throw error;

      // Success notification
      toast.success("Event created successfully");
      
      // Invalidate the events query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['events'] });
      
      // Dispatch a custom event to signal that an event was created
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
          // We don't update neighborhood_id during update as that would move the event
          // between neighborhoods which is probably not intended
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
