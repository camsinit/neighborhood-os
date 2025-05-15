
/**
 * IMPORTANT: This file has been refactored into smaller components
 * Now it just re-exports functionality from the new location
 */
import {
  useNotifications,
  BaseNotification,
} from "./useNotifications";

// Just re-export the types and hooks
export {
  useNotifications,
};

export type {
  BaseNotification,
};
