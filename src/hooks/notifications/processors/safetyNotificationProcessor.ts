
/**
 * This file handles the processing of safety notifications
 * It contains utility functions for transforming safety notification data
 */
import { BaseNotification } from "../types";

/**
 * Processes safety update notifications
 * 
 * @param safetyUpdates - The safety updates data from the database
 * @returns An array of processed notifications
 */
export const processSafetyNotifications = (safetyUpdates: any[]): BaseNotification[] => {
  console.log("[processSafetyNotifications] Processing safety notifications:", safetyUpdates.length);
  
  return safetyUpdates.map(update => ({
    id: update.id,
    user_id: update.author_id || "unknown",
    title: update.title,
    content_type: "safety_updates",
    content_id: update.id,
    notification_type: "safety", // This matches the HighlightableItemType
    created_at: update.created_at,
    updated_at: update.created_at || update.created_at, // Ensure updated_at is present
    is_read: update.is_read || false,
    is_archived: update.is_archived || false,
    context: {
      contextType: "safety_alert",
      neighborName: update.profiles?.display_name || null,
      avatarUrl: update.profiles?.avatar_url || null
    }
  }));
};
