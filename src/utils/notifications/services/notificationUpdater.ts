
/**
 * Service responsible for updating notification states (read/archived)
 */
import { supabase } from "@/integrations/supabase/client";
import { refreshEvents } from "@/utils/refreshEvents";
import { toast } from "sonner";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this module
const logger = createLogger('notificationUpdater');

/**
 * Mark a notification as read
 * 
 * @param notificationType - Type of notification (for analytics)
 * @param notificationId - ID of notification to mark as read
 * @returns Promise resolving to success boolean
 */
export async function markAsRead(notificationType: string, notificationId: string): Promise<boolean> {
  try {
    logger.debug(`Marking ${notificationType} notification ${notificationId} as read`);
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
      
    if (error) {
      logger.error('Error marking notification as read:', error);
      return false;
    }
    
    // Trigger refresh event
    refreshEvents.emit('notification-read');
    
    return true;
  } catch (error) {
    logger.error('Exception in markAsRead:', error);
    return false;
  }
}

/**
 * Archive a notification
 * 
 * @param notificationId - ID of notification to archive
 * @returns Promise resolving to success boolean
 */
export async function archiveNotification(notificationId: string): Promise<boolean> {
  try {
    logger.debug(`Archiving notification ${notificationId}`);
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_archived: true })
      .eq('id', notificationId);
      
    if (error) {
      logger.error('Error archiving notification:', error);
      toast.error("Couldn't archive notification. Please try again later.");
      return false;
    }
    
    // Trigger refresh event
    refreshEvents.emit('notification-archived');
    
    return true;
  } catch (error) {
    logger.error('Exception in archiveNotification:', error);
    toast.error("Couldn't archive notification. An unexpected error occurred.");
    return false;
  }
}

/**
 * Mark all notifications as read for the current user
 * 
 * @param userId - User ID to mark all notifications as read for
 * @returns Promise resolving to success boolean
 */
export async function markAllAsRead(userId: string): Promise<boolean> {
  try {
    logger.debug(`Marking all notifications as read for user ${userId}`);
    
    if (!userId) {
      logger.error('No user ID provided');
      return false;
    }
    
    // Update all unread notifications for this user
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
      
    if (error) {
      logger.error('Error marking all as read:', error);
      toast.error("Couldn't update notifications. Please try again later.");
      return false;
    }
    
    // Trigger refresh event
    refreshEvents.emit('notifications-all-read');
    
    return true;
  } catch (error) {
    logger.error('Exception in markAllAsRead:', error);
    toast.error("Couldn't update notifications. An unexpected error occurred.");
    return false;
  }
}
