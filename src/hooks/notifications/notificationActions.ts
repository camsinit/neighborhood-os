
/**
 * Notification Actions
 * 
 * This file contains utility functions to perform actions on notifications
 * like marking them as read or archiving them.
 */
import { supabase } from "@/integrations/supabase/client";
import { refreshEvents } from "@/utils/refreshEvents";
import { createLogger } from "@/utils/logger";

// Create a logger for this module
const logger = createLogger('notificationActions');

/**
 * Get the database table name for a notification type
 * 
 * @param contentType The content type of the notification
 * @returns The table name for the content type
 */
export const getTableName = (contentType: string): string => {
  const tableMap: Record<string, string> = {
    'events': 'events',
    'safety': 'safety_updates',
    'skills': 'skills_exchange',
    'goods': 'goods_exchange',
    'care': 'care_requests'
  };

  return tableMap[contentType] || 'notifications';
};

/**
 * Mark a notification as read
 * 
 * @param notificationType The type of notification
 * @param notificationId The ID of the notification to mark as read
 * @returns Promise resolving to a boolean indicating success
 */
export const markAsRead = async (notificationType: string, notificationId: string): Promise<boolean> => {
  try {
    logger.debug(`Marking notification ${notificationId} as read`);

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      logger.error('Error marking notification as read:', error);
      return false;
    }

    // Also update the content item if relevant
    const tableName = getTableName(notificationType);
    if (tableName !== 'notifications') {
      // Use the .from method with a type assertion to handle dynamic table names
      const { error: contentError } = await supabase
        .from(tableName as any)
        .update({ is_read: true })
        .eq('id', notificationId);
        
      if (contentError) {
        logger.error(`Error marking ${notificationType} content as read:`, contentError);
      }
    }

    // Notify subscribers that notifications have been updated
    refreshEvents.emit('notifications');
    
    return true;
  } catch (error) {
    logger.error('Error in markAsRead:', error);
    return false;
  }
};

/**
 * Archive a notification
 * 
 * @param notificationId The ID of the notification to archive
 * @returns Promise resolving to a boolean indicating success
 */
export const archiveNotification = async (notificationId: string): Promise<boolean> => {
  try {
    logger.debug(`Archiving notification ${notificationId}`);
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_archived: true })
      .eq('id', notificationId);

    if (error) {
      logger.error('Error archiving notification:', error);
      return false;
    }

    // Notify subscribers that notifications have been updated
    refreshEvents.emit('notifications');
    
    return true;
  } catch (error) {
    logger.error('Error in archiveNotification:', error);
    return false;
  }
};
