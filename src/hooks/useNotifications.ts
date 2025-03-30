
/**
 * IMPORTANT: This file has been refactored into smaller components
 * Now it just re-exports functionality from the new location
 */
import {
  useNotifications,
  BaseNotification,
  NotificationContext,
  NotificationContextType,
  archiveNotification,
  markAsRead,
  getTableName
} from "./notifications";

export {
  useNotifications,
  archiveNotification,
  markAsRead,
  getTableName
};

export type {
  BaseNotification,
  NotificationContext,
  NotificationContextType
};
