
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
  
  // Create a map to track events we've already processed to prevent duplicates
  const processedEventMap = new Map<string, boolean>();
  
  // Filter out duplicate events based on content_id and notification_type
  const uniqueEvents = events.filter(event => {
    // Create a unique key for this event
    const eventKey = `${event.id}-${event.host_id || "unknown"}`;
    
    // If we've already processed this event, skip it
    if (processedEventMap.has(eventKey)) {
      return false;
    }
    
    // Mark this event as processed
    processedEventMap.set(eventKey, true);
    return true;
  });
  
  return uniqueEvents.map(event => ({
    id: event.id,
    user_id: event.host_id || "unknown",
    title: event.title, // Adding back the title property that was removed
    content_type: "events",
    content_id: event.id,
    notification_type: "event", // This matches the HighlightableItemType
    created_at: event.created_at,
    updated_at: event.created_at || event.created_at, // Ensure updated_at is present
    is_read: event.is_read || false,
    is_archived: event.is_archived || false,
    // Add action_type to improve descriptive text
    action_type: "create", // Default to create
    context: {
      contextType: "event_invite",
      neighborName: event.profiles?.display_name || null,
      avatarUrl: event.profiles?.avatar_url || null,
      // Add event details for UI display
      eventTime: event.start_time || null,
      location: event.location || null,
      summary: `${event.profiles?.display_name || "Someone"} created an event: ${event.title}`
    }
  }));
};
