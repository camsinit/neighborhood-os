/**
 * Utility functions to handle the activities table workaround
 * 
 * This module contains functions to work around the issue with the activities table
 * not having a neighborhood_id column but the trigger expecting it
 */
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Attempt to create an event when the initial attempt fails due to activities table issue
 * 
 * @param eventData - The event data to insert
 * @param userId - Current user's ID
 * @param formTitle - The title from the form (needed for activity creation)
 * @returns The result data or throws an error
 */
export const handleActivitiesTableWorkaround = async (
  eventData: any,
  userId: string,
  formTitle: string
) => {
  console.log("[activityWorkaround] Attempting activities table workaround...");
  
  // IMPORTANT: Create a clone of the original data to avoid modifying the original
  // We need to keep neighborhood_id for the events table but avoid it for the activities trigger
  const modifiedEventData = { ...eventData };
  
  // Instead of trying to insert to both tables at once (which fails due to activities trigger),
  // we'll split this into two operations: first insert to events, then manually create the activity
  const insertResult = await supabase
    .from('events')
    .insert(modifiedEventData)
    .select();
    
  if (insertResult.error) {
    // If insertion still fails, log and throw error
    console.error("[activityWorkaround] Event insertion failed:", insertResult.error);
    throw insertResult.error;
  }
  
  const resultData = insertResult.data;
  
  // If the event was created successfully, but we still need to create an activity
  if (resultData && resultData[0]) {
    await createManualActivity(userId, resultData[0].id, formTitle);
  }
  
  // Success notification for the workaround
  toast.success("Event created successfully");
  console.log("[activityWorkaround] Successfully created event with workaround");
  
  return resultData;
};

/**
 * Create a manual activity record without using the neighborhood_id field
 * 
 * @param userId - The ID of the user creating the activity
 * @param contentId - The ID of the content (event) being created
 * @param title - The title of the content
 */
const createManualActivity = async (
  userId: string,
  contentId: string,
  title: string
) => {
  try {
    const { error: activityError } = await supabase
      .from('activities')
      .insert({
        actor_id: userId,
        activity_type: 'event_created',
        content_id: contentId,
        content_type: 'events',
        title: title
        // Intentionally omit neighborhood_id here
      });
      
    if (activityError) {
      // Log the activity creation error but don't throw - event was still created
      console.warn("[activityWorkaround] Activity creation failed, but event was created:", activityError);
    } else {
      console.log("[activityWorkaround] Activity created successfully");
    }
  } catch (activityError) {
    console.warn("[activityWorkaround] Activity creation error:", activityError);
    // Don't throw, as the event was still created
  }
};
