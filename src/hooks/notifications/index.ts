
/**
 * This file exports all the notification-related functionality
 * from a single entry point for easier imports elsewhere
 */

// Re-export the main hook
export { useNotifications } from "./useNotifications";

// Re-export types
export * from "./types";

// Re-export actions
export * from "./notificationActions";

// Re-export fetch functions
export { fetchAllNotifications } from "./fetchNotifications";
