
/**
 * IMPORTANT: This file has been refactored into smaller components
 * Now it just re-exports functionality from the new location
 */
import {
  useNotifications,
  BaseNotification,
  NotificationContext,
  NotificationContextType
} from "./useNotifications";

import {
  archiveNotification,
  archiveNotificationWithType,
  markAsRead,
  getTableName
} from "./notificationActions";

export {
  useNotifications,
  archiveNotification,
  archiveNotificationWithType,
  markAsRead,
  getTableName
};

export type {
  BaseNotification,
  NotificationContext,
  NotificationContextType
};
