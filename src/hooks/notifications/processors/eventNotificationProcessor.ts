
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
    title: event.title,
    type: "event" as const,
    created_at: event.created_at,
    is_read: event.is_read,
    is_archived: event.is_archived,
    context: {
      contextType: "event_invite" as const,
      neighborName: event.profiles?.display_name || null,
      avatarUrl: event.profiles?.avatar_url || null
    }
  }));
};
