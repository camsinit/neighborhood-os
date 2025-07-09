/**
 * Simplified Notification Service
 * 
 * Streamlined API for notification operations
 * Uses database triggers for automatic notification creation
 */
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";
import { unifiedEvents } from "@/utils/unifiedEventSystem";
import type { NotificationType, NotificationActionType } from "@/notifications/types";

// Create a dedicated logger for the notification service
const logger = createLogger('notificationService');

/**
 * Mark a notification as read
 * 
 * @param notificationId ID of the notification to mark as read
 * @returns Promise resolving to boolean indicating success
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
  try {
    logger.debug(`Marking notification ${notificationId} as read`);

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      logger.error(`Error marking notification ${notificationId} as read:`, error);
      return false;
    }

    logger.debug(`Successfully marked notification ${notificationId} as read`);
    return true;
  } catch (error) {
    logger.error(`Exception marking notification as read:`, error);
    return false;
  }
}

/**
 * Archive a notification
 * 
 * @param notificationId ID of the notification to archive
 * @returns Promise resolving to boolean indicating success
 */
export async function archiveNotification(notificationId: string): Promise<boolean> {
  try {
    logger.debug(`Archiving notification ${notificationId}`);

    const { error } = await supabase
      .from('notifications')
      .update({ is_archived: true })
      .eq('id', notificationId);

    if (error) {
      logger.error(`Error archiving notification ${notificationId}:`, error);
      return false;
    }

    logger.debug(`Successfully archived notification ${notificationId}`);
    return true;
  } catch (error) {
    logger.error(`Exception archiving notification:`, error);
    return false;
  }
}

/**
 * Mark all notifications as read for the current user
 * 
 * @returns Promise resolving to boolean indicating success
 */
export async function markAllAsRead(): Promise<boolean> {
  try {
    logger.debug('Marking all notifications as read for current user');

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

    logger.debug('Successfully marked all notifications as read');
    return true;
  } catch (error) {
    logger.error('Exception marking all notifications as read:', error);
    return false;
  }
}

/**
 * Get unread notification count for the current user
 * 
 * @returns Promise resolving to the count of unread notifications
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      logger.error('No authenticated user found');
      return 0;
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.user.id)
      .eq('is_read', false)
      .eq('is_archived', false);

    if (error) {
      logger.error('Error getting unread count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    logger.error('Exception getting unread count:', error);
    return 0;
  }
}

export default {
  markAsRead,
  archiveNotification,
  markAllAsRead,
  getUnreadCount
};
