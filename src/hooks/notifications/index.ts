
/**
 * Central export point for notifications functionality
 * This file exports everything needed for working with notifications
 * 
 * UPDATED: Now includes templated notification system
 */

// Export the hooks
export { useNotifications } from "./useNotifications";
export { useNotificationsData } from "./useNotificationsData";
export { useNotificationsRefresh } from "./useNotificationsRefresh";
export { useNotificationsPopoverData } from "./useNotificationsPopoverData";

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

// Export templated notification system
export { 
  createTemplatedNotification,
  createEventRSVPNotification,
  createSkillSessionRequestNotification,
  createNeighborJoinedNotification,
  createSafetyCommentNotification
} from "../../utils/notifications/templatedNotificationService";

export {
  processNotificationTemplate,
  getNotificationTemplate,
  getAvailableTemplateIds,
  NOTIFICATION_TEMPLATES
} from "../../utils/notifications/notificationTemplates";

export type { 
  NotificationTemplate,
  TemplatedNotificationParams 
} from "../../utils/notifications/templatedNotificationService";
