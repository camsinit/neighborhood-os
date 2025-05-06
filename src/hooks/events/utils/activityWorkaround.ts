
/**
 * Utility functions to handle the activities table operations
 * 
 * This file is now deprecated and has been replaced by direct operations 
 * in the eventServices.ts file, since we've added the event_id field
 * to the events table, eliminating the need for workarounds.
 */
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * This function is now deprecated as we have added the event_id field
 * to the events table, eliminating the need for workarounds
 */
export const handleActivitiesTableWorkaround = async (
  eventData: any,
  userId: string,
  formTitle: string
) => {
  console.log("[activityWorkaround] This function is now deprecated. Use createEvent directly from eventServices.");
  
  // For backward compatibility, just forwarding to the standard event creation
  const insertResult = await supabase
    .from('events')
    .insert(eventData)
    .select();
    
  if (insertResult.error) {
    console.error("[activityWorkaround] Event insertion failed:", insertResult.error);
    throw insertResult.error;
  }
  
  const resultData = insertResult.data;
  
  toast.success("Event created successfully");
  console.log("[activityWorkaround] Successfully created event");
  
  return resultData;
};

/**
 * This function is now deprecated as the database trigger
 * correctly handles activity creation with the event_id field
 */
const createManualActivity = async (
  userId: string,
  contentId: string,
  title: string
) => {
  console.log("[activityWorkaround] This function is now deprecated");
};
