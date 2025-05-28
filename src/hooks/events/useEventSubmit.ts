
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { transformEventFormData, transformEventUpdateData } from "./utils/eventDataTransformer";
import { createEvent, updateEvent } from "./utils/eventServices";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { refreshEvents } from "@/utils/refreshEvents";

interface EventSubmitProps {
  onSuccess: () => void;
}

/**
 * Custom hook for handling event submissions and updates
 * 
 * This hook provides functions to create and update events in the database
 * Now relies ONLY on database triggers for activity creation
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

  // State to store neighborhood timezone
  const [neighborhoodTimezone, setNeighborhoodTimezone] = useState<string>('America/Los_Angeles');

  // Fetch neighborhood timezone when neighborhood changes
  useEffect(() => {
    const fetchNeighborhoodTimezone = async () => {
      if (neighborhood?.id) {
        const { data, error } = await supabase
          .from('neighborhoods')
          .select('timezone')
          .eq('id', neighborhood.id)
          .single();
          
        if (data && !error) {
          setNeighborhoodTimezone(data.timezone || 'America/Los_Angeles');
          console.log(`[useEventSubmit] Fetched neighborhood timezone: ${data.timezone}`);
        } else {
          console.error('[useEventSubmit] Error fetching timezone:', error);
        }
      }
    };
    
    fetchNeighborhoodTimezone();
  }, [neighborhood?.id]);

  /**
   * Handles the submission of a new event
   * Database triggers handle all activity and notification creation
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
      console.log("[useEventSubmit] Attempting to insert event with database triggers:", {
        userId: user.id,
        neighborhoodId: neighborhood.id,
        neighborhoodTimezone,
        formData: { 
          ...formData, 
          title: formData.title,
          description: formData.description?.substring(0, 20) + '...',
          date: formData.date,
          time: formData.time,
          location: formData.location
        },
        timestamp: new Date().toISOString()
      });

      // Transform the form data to match database schema, using the neighborhood timezone
      const eventData = transformEventFormData(formData, user.id, neighborhood.id, neighborhoodTimezone);
      
      // Log the transformed data that will be sent to the database
      console.log("[useEventSubmit] Transformed event data:", eventData);

      // Create the event in the database - triggers handle activities/notifications automatically
      const data = await createEvent(eventData, user.id, formData.title);
      
      // Log success after database operation
      console.log("[useEventSubmit] Event created successfully with database triggers:", {
        eventId: data?.[0]?.id,
        timestamp: new Date().toISOString()
      });
      
      // Refresh UI components
      refreshEvents.emit('event-submitted');
      
      onSuccess();
      
      return data;
    } catch (error: any) {
      console.error('[useEventSubmit] Error creating event:', error);
      toast.error("Failed to create event: " + error.message);
      
      // Re-throw the error for the component to handle if needed
      throw error;
    }
  };

  /**
   * Handles the update of an existing event
   * Database triggers handle activity updates automatically
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
      console.log("[useEventSubmit] Attempting to update event with database triggers:", {
        eventId,
        userId: user.id,
        neighborhoodTimezone,
        formData: { ...formData, description: formData.description?.substring(0, 20) + '...' },
        timestamp: new Date().toISOString()
      });

      // Transform the update data, using the neighborhood timezone
      const eventData = transformEventUpdateData(formData, neighborhoodTimezone);

      // Update the event in the database - triggers handle activity updates
      const data = await updateEvent(eventId, eventData, user.id, formData.title);

      // Success notification
      toast.success("Event updated successfully");
      
      // Refresh UI components
      refreshEvents.emit('event-submitted');
      
      onSuccess();
      
      return data;
    } catch (error: any) {
      console.error('[useEventSubmit] Error updating event:', error);
      toast.error("Failed to update event: " + error.message);
      throw error;
    }
  };

  return { handleSubmit, handleUpdate };
};
