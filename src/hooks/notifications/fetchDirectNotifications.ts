
/**
 * Fetches notifications directly from the notifications table
 * This is the primary source of notification data
 */
import { supabase } from "@/integrations/supabase/client";
import { BaseNotification } from "./types";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this module
const logger = createLogger('fetchDirectNotifications');

/**
 * Fetches all notifications from the notifications table for the current user
 * 
 * @param showArchived - Whether to include archived notifications
 * @returns Array of notifications in the standard format
 */
export const fetchDirectNotifications = async (showArchived: boolean = false): Promise<BaseNotification[]> => {
  // Get the current user ID
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    logger.debug('No authenticated user found, returning empty array');
    return [];
  }
  
  // Fetch notifications with profiles information for actors
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select(`
      *,
      profiles:actor_id (
        display_name,
        avatar_url
      )
    `)
    .eq('user_id', user.id)
    .eq('is_archived', showArchived)
    .order('created_at', { ascending: false });
    
  if (error) {
    logger.error('Error fetching notifications:', error);
    throw error;
  }
  
  logger.debug(`Found ${notifications.length} notifications for user ${user.id}, showArchived=${showArchived}`);
  
  // Create a map to track notifications we've already processed to prevent duplicates
  const processedNotificationMap = new Map<string, boolean>();
  
  // Filter out duplicate notifications based on content_id and notification_type
  const uniqueNotifications = notifications.filter(notification => {
    // Create a unique key for this notification
    const notificationKey = `${notification.notification_type}-${notification.content_id}-${notification.actor_id}`;
    
    // If we've already processed this notification type for this content, skip it
    if (processedNotificationMap.has(notificationKey)) {
      return false;
    }
    
    // Mark this notification as processed
    processedNotificationMap.set(notificationKey, true);
    return true;
  });
  
  logger.debug(`After duplicate filtering: ${uniqueNotifications.length} notifications`);
  
  // Transform into BaseNotification format
  return uniqueNotifications.map(notification => {
    // Create a standardized notification object
    const baseNotification: BaseNotification = {
      id: notification.id,
      user_id: notification.user_id,
      actor_id: notification.actor_id,
      title: notification.title,
      content_type: notification.content_type,
      content_id: notification.content_id,
      notification_type: notification.notification_type,
      action_type: notification.action_type,
      action_label: notification.action_label,
      created_at: notification.created_at,
      updated_at: notification.updated_at,
      is_read: notification.is_read || false,
      is_archived: notification.is_archived || false,
      relevance_score: notification.relevance_score,
      profiles: notification.profiles,
      // Add context object for templating
      context: {
        contextType: notification.metadata?.type || "general",
        neighborName: notification.profiles?.display_name || null,
        avatarUrl: notification.profiles?.avatar_url || null
      }
    };
    
    return baseNotification;
  });
};
