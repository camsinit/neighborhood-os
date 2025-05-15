
/**
 * This file contains utility functions for notification actions
 * It imports the core functionality from our new hooks directory
 */
import { 
  getTableName,
  markAsRead,
  archiveNotification 
} from "@/hooks/notifications/notificationActions";

// Re-export the functions for backward compatibility
export {
  getTableName,
  markAsRead,
  archiveNotification
};
