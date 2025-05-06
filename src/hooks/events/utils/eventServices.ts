
/**
 * Event services for database operations
 * 
 * Handles the actual database operations for events, abstracting the Supabase calls
 */
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Create a new event in the database
 * 
 * @param eventData - The event data to insert
 * @param userId - Current user's ID
 * @param formTitle - The form title (no longer needed but kept for backward compatibility)
 * @returns The created event data or throws an error
 */
export const createEvent = async (eventData: any, userId: string, formTitle: string) => {
  // Log the actual data being sent to the database for debugging
  console.log("[eventServices] Sending to database:", eventData);

  try {
    // Simple insert with select now that we have the event_id field
    // The event_id field is automatically generated as a copy of the id field
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        time: eventData.time,
        host_id: userId,
        neighborhood_id: eventData.neighborhood_id,
        is_recurring: eventData.is_recurring || false,
        recurrence_pattern: eventData.recurrence_pattern,
        recurrence_end_date: eventData.recurrence_end_date
      })
      .select('*'); // We can now safely use select

    if (error) {
      // Log detailed error information
      console.error("[eventServices] Error inserting event:", {
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        },
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    // Log success information
    console.log("[eventServices] Event created successfully:", {
      eventId: data?.[0]?.id,
      timestamp: new Date().toISOString()
    });
    
    // Show success toast
    toast.success("Event created successfully");
    
    return data;
  } catch (error) {
    console.error("[eventServices] Caught exception creating event:", error);
    throw error;
  }
};

/**
 * Update an existing event in the database
 * 
 * @param eventId - ID of the event to update
 * @param eventData - The event data to update
 * @param userId - Current user's ID
 * @param formTitle - The new title from the form
 * @returns The updated event data or throws an error
 */
export const updateEvent = async (
  eventId: string, 
  eventData: any, 
  userId: string,
  formTitle: string
) => {
  // Log the actual data being sent to the database for debugging
  console.log("[eventServices] Sending update to database:", {
    eventId,
    ...eventData
  });

  // Update the event data
  const { error, data } = await supabase
    .from('events')
    .update(eventData)
    .eq('id', eventId)
    .eq('host_id', userId)
    .select('*'); 

  if (error) {
    // Log detailed error information
    console.error("[eventServices] Error updating event:", {
      error: {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      },
      eventId,
      timestamp: new Date().toISOString()
    });
    throw error;
  }

  // Log success information
  console.log("[eventServices] Event updated successfully:", {
    eventId,
    timestamp: new Date().toISOString()
  });

  // After successful update, also update any activities related to this event
  // This ensures that the activity feed shows the updated event title
  await updateEventActivities(eventId, formTitle);
  
  return data;
};

/**
 * Update activities related to an event
 * 
 * @param eventId - The ID of the event
 * @param title - The new title to update in activities
 */
export const updateEventActivities = async (eventId: string, title: string) => {
  const { error: activityError } = await supabase
    .from('activities')
    .update({ title })
    .eq('content_type', 'events')
    .eq('content_id', eventId);
    
  if (activityError) {
    console.error("[eventServices] Error updating related activities:", activityError);
  } else {
    console.log("[eventServices] Successfully updated related activities");
  }
};
