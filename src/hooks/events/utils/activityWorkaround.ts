

/**
 * Utility functions to handle the activities table operations
 * 
 * This module previously contained workarounds that are no longer needed
 * after adding neighborhood_id to the activities table
 */
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Create an event in the database
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
  console.log("[activityWorkaround] This function is now deprecated and simply passes through to standard event creation");
  
  // With the database schema fixed, we can now directly create events with neighborhood_id
  const insertResult = await supabase
    .from('events')
    .insert(eventData)
    .select();
    
  if (insertResult.error) {
    // Log and throw any errors that occur
    console.error("[activityWorkaround] Event insertion failed:", insertResult.error);
    throw insertResult.error;
  }
  
  const resultData = insertResult.data;
  
  // Success notification
  toast.success("Event created successfully");
  console.log("[activityWorkaround] Successfully created event");
  
  return resultData;
};

/**
 * This function is now deprecated as the activities table trigger
 * correctly handles activity creation with neighborhood_id
 */
const createManualActivity = async (
  userId: string,
  contentId: string,
  title: string
) => {
  // This function is now a no-op as the database trigger handles creating activities
  console.log("[activityWorkaround] Manual activity creation no longer needed");
};

