
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
      // If user is not logged in, show an error toast
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
      const combinedTime = formData.date && formData.time 
        ? `${formData.date}T${formData.time}` 
        : null;

      // Remove fields that don't exist in the database schema
      // IMPORTANT: Only include fields that exist in the database table
      const eventData = {
        title: formData.title,
        description: formData.description,
        time: combinedTime, // Use the combined timestamp
        location: formData.location,
        host_id: user.id,
        neighborhood_id: neighborhoodId
      };

      // Log the actual data being sent to the database for debugging
      console.log("[useEventSubmit] Sending to database:", eventData);

      const { error, data } = await supabase
        .from('events')
        .insert(eventData)
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
    } catch (error: any) {
      console.error('[useEventSubmit] Error creating event:', error);
      toast.error("Failed to create event. Please try again.");
      
      // Re-throw the error for the component to handle if needed
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

      // Only include fields that exist in the database table
      const eventData = {
        title: formData.title,
        description: formData.description,
        time: combinedTime, // Use the combined timestamp
        location: formData.location
      };

      // Log the actual data being sent to the database for debugging
      console.log("[useEventSubmit] Sending update to database:", {
        eventId,
        ...eventData
      });

      const { error, data } = await supabase
        .from('events')
        .update(eventData)
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
    } catch (error: any) {
      console.error('[useEventSubmit] Error updating event:', error);
      toast.error("Failed to update event. Please try again.");
      throw error;
    }
  };

  return { handleSubmit, handleUpdate };
};
