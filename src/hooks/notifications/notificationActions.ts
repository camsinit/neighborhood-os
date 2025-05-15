
/**
 * notificationActions.ts
 * 
 * Simplified API for notification actions
 * This file re-exports the unified client methods for easier imports
 */
import { notificationClient } from "@/utils/notifications/notificationClient";

// Re-export all methods from the notification client
export const {
  markAsRead,
  archiveNotification,
  markAllAsRead,
  getUnreadCount
} = notificationClient;

// Export the client for direct access if needed
export { notificationClient };
