
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
    title: update.title,
    type: "safety" as const,
    created_at: update.created_at,
    is_read: update.is_read,
    is_archived: update.is_archived,
    context: {
      contextType: "safety_alert" as const,
      neighborName: update.profiles?.display_name || null,
      avatarUrl: update.profiles?.avatar_url || null
    }
  }));
};
