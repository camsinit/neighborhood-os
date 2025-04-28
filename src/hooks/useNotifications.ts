
/**
 * IMPORTANT: This file has been refactored into smaller components
 * Now it just re-exports functionality from the new location
 */
import {
  useNotifications,
  BaseNotification,
  // Remove incorrect imports for NotificationContext and NotificationContextType
} from "./notifications";

export {
  useNotifications,
  archiveNotification,
  markAsRead,
  getTableName
};

export type {
  BaseNotification,
  // Remove incorrect type exports
};
