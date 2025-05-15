
/**
 * Notification action functions
 * 
 * This file contains functions for performing actions on notifications
 * such as marking as read or archiving them.
 * 
 * UPDATED: Now uses the unified notification service
 */
import { supabase } from "@/integrations/supabase/client"; // Added missing import
import notificationService from "@/utils/notifications/notificationService";
import { HighlightableItemType } from "@/utils/highlight/types";
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
      return notificationService.markAsRead(type);
    }
    
    // Get the table name for this notification type
    const table = getTableName(type);
    
    logger.debug(`Marking notification ${id} as read in ${table} table`);
    
    // For now, only handle the main notifications table
    // Future: expand to handle other tables via RPC calls
    if (table === 'notifications') {
      return notificationService.markAsRead(id);
    }
    
    // For other tables, use the legacy direct update approach
    logger.debug(`Using legacy approach for table ${table}`);
    const { error } = await supabase
      .from(table as any) // Type assertion to handle dynamic table names
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
  return notificationService.archiveNotification(id);
};

// Re-export from the service for convenience
export { getUnreadCount } from "@/utils/notifications/notificationService";
