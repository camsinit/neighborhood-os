
/**
 * This file contains utility functions for notification actions
 * It imports the core functionality from our new hooks directory
 */
import { 
  getTableName as getNotificationTableName, 
  markAsRead as markNotificationAsRead,
  archiveNotification as archiveNotificationItem
} from "@/hooks/notifications/notificationActions";

// Re-export the functions for backward compatibility
export const getTableName = getNotificationTableName;
export const markAsRead = markNotificationAsRead;
export const archiveNotification = archiveNotificationItem;
