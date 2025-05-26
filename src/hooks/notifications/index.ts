
/**
 * Central export point for notifications functionality
 * This file exports everything needed for working with notifications
 */

// Export the hooks
export { useNotifications } from "./useNotifications";
export { useNotificationsData } from "./useNotificationsData";
export { useNotificationsRefresh } from "./useNotificationsRefresh";
export { useNotificationsPopoverData } from "./useNotificationsPopoverData";
export { useNotificationDensity } from "./useNotificationDensity";

// Export the actions (consolidated utilities)
export {
  markAsRead,
  archiveNotification,
  markAllAsRead
} from "./notificationActions";

// Export types
export type { BaseNotification, SkillRequestNotification } from "./types";

// Export utility functions
export { fetchAllNotifications } from "./fetchNotifications";
export { fetchDirectNotifications } from "./fetchDirectNotifications";
