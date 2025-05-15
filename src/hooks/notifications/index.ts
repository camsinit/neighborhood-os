
/**
 * Central export point for notifications functionality
 * This file exports everything needed for working with notifications
 */

// Export the hooks
export { useNotifications } from "./useNotifications";
export { useNotificationsData } from "./useNotificationsData";
export { useNotificationsRefresh } from "./useNotificationsRefresh";
export { useNotificationsPopoverData } from "./useNotificationsPopoverData";

// Export the actions
export { 
  archiveNotification,
  markAsRead,
  getTableName
} from "./notificationActions";

// Export types
export type { BaseNotification, SkillRequestNotification } from "./types";

// Export utilities
export { fetchAllNotifications } from "./fetchNotifications";
export { fetchDirectNotifications } from "./fetchDirectNotifications";
