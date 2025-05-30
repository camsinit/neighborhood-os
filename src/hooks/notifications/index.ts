
/**
 * Central export point for notifications functionality
 * This file exports everything needed for working with notifications
 * 
 * UPDATED: Now includes comprehensive templated notification system for all modules
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

// Export templated notification system - all helper functions
export { 
  createTemplatedNotification,
  createEventRSVPNotification,
  createSkillSessionRequestNotification,
  createNeighborJoinedNotification,
  createSafetyCommentNotification,
  createGoodsResponseNotification,
  createCareResponseNotification,
  createSkillSessionConfirmedNotification,
  createSkillSessionCancelledNotification
} from "../../utils/notifications/templatedNotificationService";

// Export template processing functions
export {
  processNotificationTemplate,
  getNotificationTemplate,
  getAvailableTemplateIds,
  NOTIFICATION_TEMPLATES
} from "../../utils/notifications/notificationTemplates";

// Export types for templated notifications
export type { NotificationTemplate } from "../../utils/notifications/notificationTemplates";
export type { TemplatedNotificationParams } from "../../utils/notifications/templatedNotificationService";

// Export the unified notification service functions
export {
  createNotification,
  markAsRead as serviceMarkAsRead,
  archiveNotification as serviceArchiveNotification,
  markAllAsRead as serviceMarkAllAsRead,
  getUnreadCount
} from "../../utils/notifications/notificationService";
