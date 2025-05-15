
/**
 * notificationActions.ts
 * 
 * Unified API for notification actions
 * This provides a clean interface for components to interact with notification data
 */
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";
import { toast } from "@/hooks/use-toast";

// Create a logger for this module
const logger = createLogger('notificationActions');

/**
 * Mark a notification as read
 * 
 * @param notificationType Type of notification (used for analytics only)
 * @param notificationId ID of notification to mark as read
 * @returns Promise resolving to success boolean
 */
export const markAsRead = async (notificationType: string, notificationId: string): Promise<boolean> => {
  try {
    logger.debug(`Marking ${notificationType} notification ${notificationId} as read`);
    
    // Simple update to mark notification as read
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
      
    if (error) {
      logger.error(`Error marking notification as read:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error(`Exception in markAsRead:`, error);
    return false;
  }
};

/**
 * Archive a notification to remove it from the active list
 * 
 * @param notificationId ID of notification to archive
 * @returns Promise resolving to success boolean
 */
export const archiveNotification = async (notificationId: string): Promise<boolean> => {
  try {
    logger.debug(`Archiving notification ${notificationId}`);
    
    // Update notification to mark as archived
    const { error } = await supabase
      .from('notifications')
      .update({ is_archived: true })
      .eq('id', notificationId);
      
    if (error) {
      logger.error(`Error archiving notification:`, error);
      toast({
        title: "Couldn't archive notification",
        description: "Please try again later",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error(`Exception in archiveNotification:`, error);
    toast({
      title: "Couldn't archive notification",
      description: "An unexpected error occurred",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Mark all notifications as read for the current user
 * 
 * @returns Promise resolving to success boolean
 */
export const markAllAsRead = async (): Promise<boolean> => {
  try {
    logger.debug('Marking all notifications as read');
    
    // Get current user
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      logger.error('No authenticated user found');
      return false;
    }
    
    // Update all unread notifications for this user
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.user.id)
      .eq('is_read', false);
      
    if (error) {
      logger.error('Error marking all as read:', error);
      toast({
        title: "Couldn't mark notifications as read",
        description: "Please try again later",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error(`Exception in markAllAsRead:`, error);
    toast({
      title: "Couldn't update notifications",
      description: "An unexpected error occurred",
      variant: "destructive", 
    });
    return false;
  }
};

/**
 * Get unread notification count (without fetching full notifications)
 * Optimized for quick status checks
 * 
 * @returns Promise resolving to number of unread notifications
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    // Get current user
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      logger.debug('No authenticated user found for unread count');
      return 0;
    }
    
    // Use count query for efficiency (doesn't fetch actual rows)
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
    logger.error(`Exception in getUnreadCount:`, error);
    return 0;
  }
};
