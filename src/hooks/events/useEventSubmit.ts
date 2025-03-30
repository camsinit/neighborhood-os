
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";

interface EventSubmitProps {
  onSuccess: () => void;
}

/**
 * Custom hook for handling event submissions and updates
 * 
 * This hook provides functions to create and update events in the database
 * 
 * @param onSuccess - Callback function to run after successful submission
 * @returns Object containing handleSubmit and handleUpdate functions
 */
export const useEventSubmit = ({ onSuccess }: EventSubmitProps) => {
  // Get the current authenticated user
  const user = useUser();
  
  // Get the query client for cache invalidation
  const queryClient = useQueryClient();
  
  // Get the current neighborhood
  const neighborhood = useCurrentNeighborhood();

  /**
   * Handles the submission of a new event
   * 
   * @param formData - The form data containing event details
   * @returns The created event data or undefined if there was an error
   */
  const handleSubmit = async (formData: any) => {
    // Check if the user is authenticated
    if (!user) {
      // If user is not logged in, show an error toast
      toast.error("You must be logged in to create an event");
      return;
    }

    // Check if neighborhood exists and has an ID
    if (!neighborhood?.id) {
      toast.error("You must be part of a neighborhood to create an event");
      return;
    }

    try {
      // Add detailed logging before the insert operation
      console.log("[useEventSubmit] Attempting to insert event:", {
        userId: user.id,
        neighborhoodId: neighborhood.id,
        formData: { ...formData, description: formData.description?.substring(0, 20) + '...' },
        timestamp: new Date().toISOString()
      });

      // Transform the date and time fields into a single ISO timestamp
      const combinedTime = formData.date && formData.time 
        ? `${formData.date}T${formData.time}` 
        : null;

      // IMPORTANT: Filter the form data to only include fields that exist in the events table
      // This ensures we don't try to insert fields like isRecurring that are UI-only
      const eventData = {
        title: formData.title,
        description: formData.description,
        time: combinedTime, // Use the combined timestamp
        location: formData.location,
        host_id: user.id,
        neighborhood_id: neighborhood.id // Use the neighborhood.id (string) not the whole object
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
          neighborhoodId: neighborhood.id,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      // Log success information
      console.log("[useEventSubmit] Event created successfully:", {
        eventId: data?.[0]?.id,
        userId: user.id,
        neighborhoodId: neighborhood.id,
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

  /**
   * Handles the update of an existing event
   * 
   * @param eventId - The ID of the event to update
   * @param formData - The form data containing updated event details
   * @returns The updated event data or undefined if there was an error
   */
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

      // IMPORTANT: Filter to only include fields that exist in the database schema
      const eventData = {
        title: formData.title,
        description: formData.description,
        time: combinedTime, // Use the combined timestamp
        location: formData.location
        // Do NOT include UI-only fields like isRecurring, recurrencePattern, etc.
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

      // After successful update, also update any activities related to this event
      // This ensures that the activity feed shows the updated event title
      const { error: activityError } = await supabase
        .from('activities')
        .update({ title: formData.title })
        .eq('content_type', 'events')
        .eq('content_id', eventId);
        
      if (activityError) {
        console.error("[useEventSubmit] Error updating related activities:", activityError);
      } else {
        console.log("[useEventSubmit] Successfully updated related activities");
      }

      // Success notification
      toast.success("Event updated successfully");
      
      // Invalidate queries to refresh the data
      // This will update all components that display event data, including notifications and activity feed
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
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
