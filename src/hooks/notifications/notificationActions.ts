
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
 * @param notification The notification to mark as read
 * @returns Promise resolving to a boolean indicating success
 */
export const markAsRead = async (notification: { 
  id: string, 
  content_type?: string, 
  content_id?: string 
}): Promise<boolean> => {
  try {
    logger.debug(`Marking notification ${notification.id} as read`);

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notification.id);

    if (error) {
      logger.error('Error marking notification as read:', error);
      return false;
    }

    // Also update the content item if relevant
    if (notification.content_type && notification.content_id) {
      const tableName = getTableName(notification.content_type);
      
      if (tableName !== 'notifications') {
        const { error: contentError } = await supabase
          .from(tableName)
          .update({ is_read: true })
          .eq('id', notification.content_id);
          
        if (contentError) {
          logger.error(`Error marking ${notification.content_type} content as read:`, contentError);
        }
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
 * @param notification The notification to archive
 * @returns Promise resolving to a boolean indicating success
 */
export const archiveNotification = async (notification: { 
  id: string 
}): Promise<boolean> => {
  try {
    logger.debug(`Archiving notification ${notification.id}`);
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_archived: true })
      .eq('id', notification.id);

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
