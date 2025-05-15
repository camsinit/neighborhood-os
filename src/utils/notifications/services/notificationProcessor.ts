
/**
 * Service responsible for processing raw notification data
 */
import { BaseNotification } from "@/hooks/notifications/types";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this module
const logger = createLogger('notificationProcessor');

/**
 * Process raw notifications to standardize format
 * 
 * @param notifications - Raw notifications from database
 * @returns Processed notifications with standardized format
 */
export function processNotifications(notifications: any[]): BaseNotification[] {
  logger.debug(`Processing ${notifications.length} notifications`);
  
  return notifications.map(notification => {
    // Extract profile data if available
    const actorProfile = notification.profiles || {};
    
    // Build context object from metadata
    const context = {
      contextType: notification.notification_type || 'general',
      neighborName: actorProfile.display_name || "A neighbor",
      avatarUrl: actorProfile.avatar_url || null,
      ...(notification.metadata || {})
    };
    
    // Return standardized notification
    return {
      id: notification.id,
      user_id: notification.user_id,
      title: notification.title || "New notification",
      actor_id: notification.actor_id,
      content_type: notification.content_type || "general",
      content_id: notification.content_id,
      notification_type: notification.notification_type || "general",
      action_type: notification.action_type || 'view',
      action_label: notification.action_label || 'View',
      is_read: notification.is_read || false,
      is_archived: notification.is_archived || false,
      created_at: notification.created_at,
      updated_at: notification.updated_at || notification.created_at,
      context,
      description: notification.description || null,
      profiles: notification.profiles || null
    };
  });
}
