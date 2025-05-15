
/**
 * Notification action functions
 * 
 * This file contains functions for performing actions on notifications
 * such as marking as read or archiving them.
 */
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";

// Create a logger for this module
const logger = createLogger('notificationActions');

/**
 * Helper function to determine the table name for a notification type
 * This is needed because some notifications are stored in specific tables
 * while others use the generic notifications table
 * 
 * @param type The notification type
 * @returns The corresponding database table name
 */
export const getTableName = (type: string): string => {
  // Map notification types to their respective tables
  // If no mapping exists, default to the 'notifications' table
  switch (type.toLowerCase()) {
    case 'safety':
      return 'safety_updates';
    case 'event':
      return 'events';
    case 'skills':
      return 'skills_exchange';
    case 'goods':
      return 'goods_exchange';
    case 'support':
      return 'support_requests';
    case 'neighbors':
      return 'neighborhood_members';
    default:
      // For any other notification types, use the generic notifications table
      return 'notifications';
  }
};

/**
 * Mark a notification as read
 * 
 * @param type The notification type or notification ID
 * @param id The notification ID (optional when type is actually an ID)
 * @returns Promise resolving to success or failure
 */
export const markAsRead = async (type: string, id?: string): Promise<boolean> => {
  try {
    // If only one parameter is provided, assume it's the notification ID
    // and use the notifications table
    if (!id) {
      logger.debug(`Marking notification ${type} as read (direct ID mode)`);
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', type);
        
      if (error) {
        logger.error(`Error marking notification as read:`, error);
        return false;
      }
      
      return true;
    }
    
    // Get the table name for this notification type
    const table = getTableName(type);
    
    logger.debug(`Marking notification ${id} as read in ${table} table`);
    
    // Update the notification in the appropriate table
    const { error } = await supabase
      .from(table)
      .update({ is_read: true })
      .eq('id', id);
    
    if (error) {
      logger.error(`Error marking notification as read in ${table}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error("Unexpected error marking notification as read:", error);
    return false;
  }
};

/**
 * Archive a notification
 * 
 * @param id The notification ID
 * @returns Promise resolving to success or failure
 */
export const archiveNotification = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_archived: true })
      .eq('id', id);
      
    if (error) {
      logger.error(`Error archiving notification:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error("Unexpected error archiving notification:", error);
    return false;
  }
};

/**
 * Get unread notifications count
 * 
 * @returns Promise resolving to the count of unread notifications
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .eq('is_archived', false);
      
    if (error) {
      logger.error(`Error getting unread count:`, error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    logger.error("Unexpected error getting unread count:", error);
    return 0;
  }
};
