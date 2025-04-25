
/**
 * This file contains functions for performing actions on notifications,
 * such as marking them as read or archiving them
 */
import { supabase } from "@/integrations/supabase/client";

// Updated to include new tables for the new notification types
export type TableName = "safety_updates" | "events" | "support_requests" | "skill_sessions" | "goods_exchange" | "neighborhood_members";

/**
 * Gets the appropriate database table name for a notification type
 * 
 * @param type The notification type
 * @returns The corresponding database table name
 */
export const getTableName = (
  type: "safety" | "event" | "support" | "skills" | "goods" | "neighbors"
): TableName => {
  switch (type) {
    case "safety":
      return "safety_updates";
    case "event":
      return "events";
    case "support":
      return "support_requests";
    case "skills":
      return "skill_sessions";
    case "goods":
      return "goods_exchange";
    case "neighbors":
      return "neighborhood_members";
  }
};

/**
 * Marks a notification as read in the database
 * 
 * @param type The notification type
 * @param itemId The ID of the notification item
 * @returns A promise that resolves when the operation is complete
 */
export const markAsRead = async (
  type: "safety" | "event" | "support" | "skills" | "goods" | "neighbors", 
  itemId: string
) => {
  const table = getTableName(type);
  await supabase
    .from(table)
    .update({ is_read: true })
    .eq('id', itemId);
};

/**
 * Archives a notification in the database
 * 
 * @param itemId The ID of the notification item
 * @returns A promise that resolves when the operation is complete
 */
export const archiveNotification = async (itemId: string) => {
  // When the type is not specified, we can use a generic approach
  // This function should try to archive the notification in all possible tables
  // This is temporary until we have a more robust notification system
  
  console.log("[archiveNotification] Archiving notification:", itemId);
  
  try {
    // Try to update the notification in all possible tables
    const tables: TableName[] = [
      "safety_updates", 
      "events", 
      "support_requests", 
      "skill_sessions",
      "goods_exchange", 
      "neighborhood_members"
    ];
    
    // Run updates in parallel for efficiency
    await Promise.all(tables.map(async (table) => {
      try {
        await supabase
          .from(table)
          .update({ is_archived: true })
          .eq('id', itemId);
      } catch (error) {
        // Silently fail for tables where the ID doesn't exist
        console.debug(`[archiveNotification] ID not found in table ${table}:`, error);
      }
    }));
    
    console.log("[archiveNotification] Successfully archived notification");
  } catch (error) {
    console.error("[archiveNotification] Error archiving notification:", error);
    throw error;
  }
};

// Also export a typed version for backward compatibility
export const archiveNotificationWithType = async (
  type: "safety" | "event" | "support" | "skills" | "goods" | "neighbors", 
  itemId: string
) => {
  const table = getTableName(type);
  await supabase
    .from(table)
    .update({ is_archived: true })
    .eq('id', itemId);
};
