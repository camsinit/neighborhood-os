
/**
 * IMPORTANT: This file has been refactored into smaller components
 * Now it just re-exports functionality from the new location
 */
import {
  useNotifications,
  BaseNotification,
} from "./notifications";

// Import the necessary functions from notificationActions
import {
  archiveNotification,
  markAsRead,
  getTableName
} from "./notifications/notificationActions";

export {
  useNotifications,
  archiveNotification,
  markAsRead,
  getTableName
};

export type {
  BaseNotification,
};
