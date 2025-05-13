
/**
 * This file contains functionality to fetch direct notifications from the notifications table
 * These are notifications created by database triggers or API calls that aren't derived from content tables
 */
import { supabase } from "@/integrations/supabase/client";
import { BaseNotification } from "./types";
import { createLogger } from "@/utils/logger";

const logger = createLogger('fetchDirectNotifications');

/**
 * Fetch direct notifications from the dedicated notifications table
 * 
 * @param showArchived - Whether to include archived notifications
 * @returns Formatted array of notifications
 */
export const fetchDirectNotifications = async (showArchived: boolean): Promise<BaseNotification[]> => {
  // Get the current user - we need their ID to fetch their notifications
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  
  // If no user is authenticated, return empty array
  if (!userId) {
    logger.debug('No user ID found, returning empty notifications');
    return [];
  }

  // Log the query parameters for debugging
  logger.debug('Fetching direct notifications with params:', {
    userId,
    showArchived
  });
  
  // Query the notifications table directly with a left join to get actor profiles
  // Using LEFT JOIN ensures we get notifications even if profile lookup fails
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select(`
      *,
      profiles:actor_id (
        display_name,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .eq('is_archived', showArchived);
    
  if (error) {
    logger.error('Error fetching direct notifications:', error);
    return [];
  }
  
  logger.debug(`Found ${notifications?.length || 0} direct notifications`);
  
  // Process the notifications to match the BaseNotification format
  return processDirectNotifications(notifications || []);
};

/**
 * Process raw notifications from the notifications table to match the BaseNotification format
 * 
 * @param notifications - Raw notifications from the database
 * @returns Processed notifications adhering to BaseNotification interface
 */
export const processDirectNotifications = (notifications: any[]): BaseNotification[] => {
  return notifications.map(notification => {
    // Extract profile data if available, provide fallbacks if not
    const actorProfile = notification.profiles || {};
    
    // Build a standardized context object from metadata
    const notificationContext = {
      contextType: notification.notification_type || 'general',
      neighborName: actorProfile.display_name || "A neighbor",
      avatarUrl: actorProfile.avatar_url || null,
      ...(notification.metadata || {})
    };
    
    // Return a properly formatted BaseNotification
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
      context: notificationContext,
      // Include additional fields for consistency with other notification types
      description: notification.description || null,
      profiles: notification.profiles || null
    };
  });
};
