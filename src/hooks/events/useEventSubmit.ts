import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { transformEventFormData, transformEventUpdateData } from "./utils/eventDataTransformer";
import { createEvent, updateEvent } from "./utils/eventServices";

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

      // Transform the form data to match database schema
      const eventData = transformEventFormData(formData, user.id, neighborhood.id);

      // Create the event in the database - we can now use the direct createEvent function
      // since the neighborhood_id column exists in the activities table
      const data = await createEvent(eventData, user.id, formData.title);
      
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

      // Transform the update data
      const eventData = transformEventUpdateData(formData);

      // Update the event in the database
      const data = await updateEvent(eventId, eventData, user.id, formData.title);

      // Success notification
      toast.success("Event updated successfully");
      
      // Invalidate queries to refresh the data
      // This will update all components that display event data, including notifications and activity feed
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Dispatch a custom event to signal that an event was updated
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
