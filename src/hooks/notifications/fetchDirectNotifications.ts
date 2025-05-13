
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
  
  try {
    // Using a LEFT JOIN instead of the foreign key reference to avoid foreign key errors
    // This provides better error handling if profile data is not available
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select(`
        *,
        profiles:actor_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .eq('is_archived', showArchived);
      
    if (error) {
      // Log the error but don't throw - let's recover gracefully
      logger.error('Error fetching direct notifications:', error);
      return [];
    }
    
    logger.debug(`Found ${notifications?.length || 0} direct notifications`);
    
    // Process the notifications to match the BaseNotification format
    return processDirectNotifications(notifications || []);
  } catch (error) {
    // Add top-level error handling
    logger.error('Unexpected error in fetchDirectNotifications:', error);
    return [];
  }
};

/**
 * Process raw notifications from the notifications table to match the BaseNotification format
 * Now with better error handling for missing profiles
 * 
 * @param notifications - Raw notifications from the database
 * @returns Processed notifications adhering to BaseNotification interface
 */
export const processDirectNotifications = (notifications: any[]): BaseNotification[] => {
  return notifications.map(notification => {
    try {
      // Extract profile data if available, use fallbacks if not
      const actorProfile = notification.profiles || {};
      
      // Build a standardized context object from metadata
      // This helps with rendering consistent notification messages
      const notificationContext = {
        contextType: notification.notification_type || 'general',
        neighborName: actorProfile.display_name || 'Unknown User',
        avatarUrl: actorProfile.avatar_url || null,
        ...(notification.metadata || {})
      };
      
      // Generate a user-friendly summary based on available information
      const summary = generateNotificationSummary(notification, actorProfile);
      
      // Include summary in context
      const context = {
        ...notificationContext,
        summary
      };
      
      // Return a properly formatted BaseNotification
      return {
        id: notification.id,
        user_id: notification.user_id,
        title: notification.title || 'Notification',
        actor_id: notification.actor_id,
        content_type: standardizeContentType(notification.content_type || 'general'), 
        content_id: notification.content_id || '',
        notification_type: standardizeNotificationType(notification.notification_type || 'general'), 
        action_type: notification.action_type || 'view',
        action_label: notification.action_label || 'View',
        is_read: notification.is_read || false,
        is_archived: notification.is_archived || false,
        created_at: notification.created_at || new Date().toISOString(),
        updated_at: notification.updated_at || notification.created_at || new Date().toISOString(),
        context,
        // Include additional fields for consistency with other notification types
        description: notification.description || '',
        profiles: notification.profiles || null
      };
    } catch (error) {
      // If processing a single notification fails, log it but don't crash the whole function
      logger.error('Error processing notification:', error, notification);
      
      // Return a minimal valid notification to avoid breaking the UI
      return {
        id: notification.id || 'error-id',
        user_id: notification.user_id || '',
        title: 'Notification error',
        actor_id: notification.actor_id,
        content_type: 'error',
        content_id: notification.content_id || '',
        notification_type: 'general',
        action_type: 'view',
        action_label: 'View',
        is_read: false,
        is_archived: false,
        created_at: notification.created_at || new Date().toISOString(),
        updated_at: notification.updated_at || new Date().toISOString(),
        context: { summary: 'There was an error loading this notification' }
      };
    }
  });
};

/**
 * Generate a human-readable summary of the notification
 * This helps create consistent notification messages across different types
 * 
 * @param notification - The notification object
 * @param actorProfile - The actor's profile data
 * @returns A formatted summary string
 */
const generateNotificationSummary = (notification: any, actorProfile: any): string => {
  // Use a fallback name if profile data is missing
  const actorName = actorProfile?.display_name || "Someone";
  
  // Check notification type to create appropriate summary
  switch (notification.notification_type) {
    case 'event':
      if (notification.action_type === 'rsvp') {
        return `${actorName} RSVPed to your event: ${notification.title || 'an event'}`;
      }
      return `${actorName} mentioned an event: ${notification.title || 'an event'}`;
      
    case 'safety':
      if (notification.content_type === 'safety_comment') {
        return `${actorName} commented on your update: ${notification.title || 'a safety update'}`;
      }
      return `${actorName} posted a safety update: ${notification.title || 'a safety update'}`;
      
    case 'skills':
      if (notification.action_type === 'schedule') {
        return `${actorName} requested to schedule: ${notification.title || 'a skill session'}`;
      } else if (notification.action_type === 'confirm') {
        return `${actorName} confirmed a skill session: ${notification.title || 'a skill session'}`;
      }
      return `${actorName} shared or requested a skill: ${notification.title || 'a skill'}`;
      
    case 'goods':
      if (notification.action_type === 'claim') {
        return `${actorName} wants your item: ${notification.title || 'an item'}`;
      }
      return `${actorName} shared or requested an item: ${notification.title || 'an item'}`;
      
    default:
      // Default to the notification title if we can't generate a better summary
      return notification.title || `New notification from ${actorName}`;
  }
};

/**
 * Standardize content type strings to ensure consistency
 * This helps with the issue of some notifications using 'event' vs 'events'
 * 
 * @param contentType - The original content type string
 * @returns A standardized content type string
 */
export const standardizeContentType = (contentType: string): string => {
  // Map of original content types to standardized versions
  // This ensures all code uses the same content type strings
  const contentTypeMap: Record<string, string> = {
    'event': 'events',
    'safety': 'safety_updates',
    'skill': 'skills_exchange',
    'good': 'goods_exchange',
    'support': 'support_requests'
  };
  
  return contentTypeMap[contentType] || contentType;
};

/**
 * Standardize notification type strings
 * 
 * @param notificationType - The original notification type
 * @returns A standardized notification type string
 */
export const standardizeNotificationType = (notificationType: string): string => {
  // Map singular to plural forms for consistency
  const notificationTypeMap: Record<string, string> = {
    'event': 'event',
    'safety_update': 'safety',
    'skill': 'skills',
    'good': 'goods'
  };
  
  return notificationTypeMap[notificationType] || notificationType;
};
