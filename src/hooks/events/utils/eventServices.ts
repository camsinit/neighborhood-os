
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";

// Create a logger for this file
const logger = createLogger('eventServices');

/**
 * Creates a new event in the database
 * 
 * @param eventData - The event data to insert
 * @param userId - The ID of the user creating the event
 * @param eventTitle - The title of the event
 * @returns A Promise that resolves to the created event data
 */
export const createEvent = async (
  eventData: any, 
  userId: string,
  eventTitle: string
): Promise<any> => {
  // Log event creation attempt
  console.log("[eventServices] Creating event:", eventData);

  // Insert the event into the database
  const { data, error } = await supabase
    .from('events')
    .insert(eventData)
    .select();

  // Handle any database errors
  if (error) {
    console.error("[eventServices] Error creating event:", error);
    throw error;
  }

  console.log("[eventServices] Event created successfully:", data);
  
  // No need to call edge function - database trigger will create notifications
  
  return data;
};

/**
 * Updates an existing event in the database
 * 
 * @param eventId - The ID of the event to update
 * @param eventData - The updated event data
 * @param userId - The ID of the user updating the event
 * @param eventTitle - The title of the event
 * @returns A Promise that resolves to the updated event data
 */
export const updateEvent = async (
  eventId: string, 
  eventData: any,
  userId: string,
  eventTitle: string
): Promise<any> => {
  // Log event update attempt
  console.log("[eventServices] Updating event:", eventId, eventData);

  // Update the event in the database
  const { data, error } = await supabase
    .from('events')
    .update(eventData)
    .eq('id', eventId)
    .select();

  // Handle any database errors
  if (error) {
    console.error("[eventServices] Error updating event:", error);
    throw error;
  }

  console.log("[eventServices] Event updated successfully:", data);
  
  // No need to call edge function - database trigger will create notifications
  
  return data;
};

/**
 * Deletes an event from the database
 * 
 * @param eventId - The ID of the event to delete
 * @returns A Promise that resolves when the event is deleted
 */
export const deleteEvent = async (eventId: string): Promise<void> => {
  // Log event deletion attempt
  console.log("[eventServices] Deleting event:", eventId);

  // Delete the event from the database
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  // Handle any database errors
  if (error) {
    console.error("[eventServices] Error deleting event:", error);
    throw error;
  }

  console.log("[eventServices] Event deleted successfully");
};
