
/**
 * Notification Actions
 * 
 * This file contains utility functions for performing actions on notifications,
 * such as marking them as read or archiving them.
 */
import { supabase } from "@/integrations/supabase/client";
import { refreshEvents } from "@/utils/refreshEvents";
import { createLogger } from "@/utils/logger";

// Create a logger for this module
const logger = createLogger('notificationActions');

/**
 * Mark a notification as read
 * 
 * @param notificationType The type of notification (for logging purposes)
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

/**
 * Mark all notifications as read for the current user
 * 
 * @returns Promise resolving to boolean indicating success
 */
export const markAllAsRead = async (): Promise<boolean> => {
  try {
    logger.debug('Marking all notifications as read');

    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      logger.error('No authenticated user found');
      return false;
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.user.id)
      .eq('is_read', false);

    if (error) {
      logger.error('Error marking all notifications as read:', error);
      return false;
    }
    
    // Notify subscribers that notifications have been updated
    refreshEvents.emit('notifications');
    
    return true;
  } catch (error) {
    logger.error('Error marking all as read:', error);
    return false;
  }
};

// Export all functions
export default {
  markAsRead,
  archiveNotification,
  markAllAsRead
};
