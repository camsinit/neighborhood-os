
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
  
  return events.map(event => {
    // Parse notification metadata for context
    const metadata = event.metadata || {};
    
    // Get action type from metadata or default to "create"
    const actionType = metadata.contextType === 'event_update' ? 'update' :
                      metadata.type === 'rsvp' ? 'rsvp' :
                      'create';
    
    // Build the notification object
    return {
      id: event.id,
      user_id: event.user_id || "unknown",
      title: event.title, 
      content_type: "events",
      content_id: event.content_id,
      notification_type: "event", 
      created_at: event.created_at,
      updated_at: event.updated_at || event.created_at,
      is_read: event.is_read || false,
      is_archived: event.is_archived || false,
      action_type: actionType,
      action_label: event.action_label || "View Event", 
      context: {
        contextType: metadata.contextType || "event_invite",
        neighborName: event.actor_display_name || event.profiles?.display_name || null,
        avatarUrl: event.actor_avatar_url || event.profiles?.avatar_url || null,
        eventTime: metadata.eventTime || null,
        location: metadata.location || null,
        changes: metadata.changes || null,
        summary: buildEventSummary(event, actionType, metadata)
      }
    };
  });
};

/**
 * Builds a descriptive summary for the event notification
 */
function buildEventSummary(event: any, actionType: string, metadata: any): string {
  const actorName = event.actor_display_name || event.profiles?.display_name || "Someone";
  
  switch(actionType) {
    case 'update':
      if (metadata.changes) {
        return `${actorName} updated the ${metadata.changes} of an event`;
      }
      return `${actorName} updated event details`;
      
    case 'rsvp':
      return `${actorName} is attending an event`;
      
    case 'create':
    default:
      return `${actorName} created an event`;
  }
}
