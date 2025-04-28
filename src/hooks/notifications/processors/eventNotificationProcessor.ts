
/**
 * This file handles the processing of event notifications
 * It contains utility functions for transforming event notification data
 */
import { BaseNotification } from "../types";

/**
 * Processes event notifications
 * 
 * @param events - The events data from the database
 * @returns An array of processed notifications
 */
export const processEventNotifications = (events: any[]): BaseNotification[] => {
  console.log("[processEventNotifications] Processing event notifications:", events.length);
  
  return events.map(event => ({
    id: event.id,
    user_id: event.host_id || "unknown",
    title: event.title,
    content_type: "events",
    content_id: event.id,
    notification_type: "event", // This matches the HighlightableItemType
    created_at: event.created_at,
    updated_at: event.created_at || event.created_at, // Ensure updated_at is present
    is_read: event.is_read || false,
    is_archived: event.is_archived || false,
    context: {
      contextType: "event_invite",
      neighborName: event.profiles?.display_name || null,
      avatarUrl: event.profiles?.avatar_url || null
    }
  }));
};
