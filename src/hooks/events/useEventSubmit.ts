
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
      // Add detailed logging before the insert operation
      console.log("[useEventSubmit] Attempting to insert event:", {
        userId: user.id,
        neighborhoodId,
        formData: { ...formData, description: formData.description?.substring(0, 20) + '...' },
        timestamp: new Date().toISOString()
      });

      // Transform the date and time fields into a single ISO timestamp
      // The database expects a 'time' field, not 'date' field
      const combinedTime = formData.date && formData.time 
        ? `${formData.date}T${formData.time}` 
        : null;

      // Remove the separate date field since it's not in the database schema
      const { date, ...restFormData } = formData;

      const { error, data } = await supabase
        .from('events')
        .insert({
          ...restFormData,
          time: combinedTime, // Use the combined ISO timestamp
          host_id: user.id,
          neighborhood_id: neighborhoodId
        })
        .select();

      if (error) {
        // Log detailed error information
        console.error("[useEventSubmit] Error inserting event:", {
          error: {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          },
          userId: user.id,
          neighborhoodId,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      // Log success information
      console.log("[useEventSubmit] Event created successfully:", {
        eventId: data?.[0]?.id,
        userId: user.id,
        neighborhoodId,
        timestamp: new Date().toISOString()
      });

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
      console.error('[useEventSubmit] Error creating event:', error);
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
      // Add detailed logging before the update operation
      console.log("[useEventSubmit] Attempting to update event:", {
        eventId,
        userId: user.id,
        formData: { ...formData, description: formData.description?.substring(0, 20) + '...' },
        timestamp: new Date().toISOString()
      });

      // Transform the date and time fields into a single ISO timestamp
      const combinedTime = formData.date && formData.time 
        ? `${formData.date}T${formData.time}` 
        : null;

      // Remove the separate date field since it's not in the database schema
      const { date, ...restFormData } = formData;

      const { error, data } = await supabase
        .from('events')
        .update({
          title: restFormData.title,
          description: restFormData.description,
          time: combinedTime, // Use the combined timestamp
          location: restFormData.location,
          is_recurring: restFormData.isRecurring,
          recurrence_pattern: restFormData.isRecurring ? restFormData.recurrencePattern : null,
          recurrence_end_date: restFormData.isRecurring ? restFormData.recurrenceEndDate : null,
        })
        .eq('id', eventId)
        .eq('host_id', user.id)
        .select();

      if (error) {
        // Log detailed error information
        console.error("[useEventSubmit] Error updating event:", {
          error: {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          },
          eventId,
          userId: user.id,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      // Log success information
      console.log("[useEventSubmit] Event updated successfully:", {
        eventId,
        userId: user.id,
        timestamp: new Date().toISOString()
      });

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
      console.error('[useEventSubmit] Error updating event:', error);
      toast.error("Failed to update event. Please try again.");
      throw error;
    }
  };

  return { handleSubmit, handleUpdate };
};
