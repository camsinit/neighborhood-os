
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";

// Create a logger for this file
const logger = createLogger('eventServices');

/**
 * Creates a new event in the database
 * Database triggers handle all activity and notification creation automatically
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
  logger.info("=== EVENT CREATION STARTED ===", { 
    title: eventTitle, 
    userId,
    groupId: eventData.group_id,
    neighborhoodId: eventData.neighborhood_id
  });

  logger.info("EVENT CREATE: Inserting event record");
  // Insert the event into the database - triggers handle everything else
  const { data, error } = await supabase
    .from('events')
    .insert(eventData)
    .select();

  // Handle any database errors
  if (error) {
    logger.error("=== EVENT CREATION FAILED ===", { error, eventTitle, userId });
    throw error;
  }

  logger.info("=== EVENT CREATION SUCCESS ===", {
    eventId: data?.[0]?.id,
    title: eventTitle,
    message: 'Database triggers should now create activity + notifications'
  });
  
  return data;
};

/**
 * Updates an existing event in the database
 * Database triggers handle activity updates automatically
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
  logger.debug("Updating event:", { eventId, title: eventTitle });

  // Update the event in the database - triggers handle activity updates
  const { data, error } = await supabase
    .from('events')
    .update(eventData)
    .eq('id', eventId)
    .select();

  // Handle any database errors
  if (error) {
    logger.error("Error updating event:", error);
    throw error;
  }

  logger.info("Event updated successfully:", {
    eventId,
    title: eventTitle
  });
  
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
  logger.debug("Deleting event:", eventId);

  // Delete the event from the database
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  // Handle any database errors
  if (error) {
    logger.error("Error deleting event:", error);
    throw error;
  }

  logger.info("Event deleted successfully");
};
