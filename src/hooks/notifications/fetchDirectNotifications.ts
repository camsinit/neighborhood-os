
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
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  
  if (!userId) {
    logger.debug('No user ID found, returning empty notifications');
    return [];
  }

  // Log the query parameters for debugging
  logger.debug('Fetching direct notifications with params:', {
    userId,
    showArchived
  });
  
  // Query the notifications table directly
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
    // Extract profile data if available
    const actorProfile = notification.profiles || {};
    
    // Build a standardized context object from metadata
    const notificationContext = {
      contextType: notification.notification_type || 'general',
      neighborName: actorProfile.display_name || null,
      avatarUrl: actorProfile.avatar_url || null,
      ...(notification.metadata || {})
    };
    
    // Generate a summary based on available information
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
      title: notification.title,
      actor_id: notification.actor_id,
      content_type: standardizeContentType(notification.content_type),
      content_id: notification.content_id,
      notification_type: standardizeNotificationType(notification.notification_type),
      action_type: notification.action_type || 'view',
      action_label: notification.action_label || 'View',
      is_read: notification.is_read || false,
      is_archived: notification.is_archived || false,
      created_at: notification.created_at,
      updated_at: notification.updated_at || notification.created_at,
      context,
      // Include additional fields for consistency
      description: notification.description || null,
      profiles: notification.profiles || null
    };
  });
};

/**
 * Generate a human-readable summary of the notification
 * 
 * @param notification - The notification object
 * @param actorProfile - The actor's profile data
 * @returns A formatted summary string
 */
const generateNotificationSummary = (notification: any, actorProfile: any): string => {
  const actorName = actorProfile?.display_name || "Someone";
  
  // Check notification type to create appropriate summary
  switch (notification.notification_type) {
    case 'event':
      if (notification.action_type === 'rsvp') {
        return `${actorName} RSVPed to your event: ${notification.title}`;
      }
      return `${actorName} mentioned an event: ${notification.title}`;
      
    case 'safety':
      return `${actorName} posted a safety update: ${notification.title}`;
      
    case 'skills':
      return `${actorName} shared or requested a skill: ${notification.title}`;
      
    case 'goods':
      return `${actorName} shared or requested an item: ${notification.title}`;
      
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
