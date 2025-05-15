
/**
 * IMPORTANT: This file has been refactored into smaller components
 * Now it just re-exports functionality from the new location
 */
import {
  useNotifications,
  BaseNotification,
} from "./useNotifications";

import {
  archiveNotification,
  markAsRead,
  getTableName
} from "./notificationActions";

export {
  useNotifications,
  archiveNotification,
  markAsRead,
  getTableName
};

export type {
  BaseNotification,
};
