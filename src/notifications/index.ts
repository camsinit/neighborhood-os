
/**
 * Main Notifications Module Export
 * 
 * Single entry point for the new streamlined notification system
 */

// Main hooks
export { useNotifications, useUnreadCount } from './hooks/useNotifications';
export { useNotificationActions } from './hooks/useNotificationActions';
export { useNotificationNavigation } from './hooks/useNotificationNavigation';

// Components
export { default as NotificationBell } from './components/NotificationBell';
export { default as NotificationItem } from './components/NotificationItem';
export { default as NotificationList } from './components/NotificationList';

// Types
export type { 
  Notification, 
  EnhancedNotification, 
  NotificationFilters,
  NotificationActionResult 
} from './types';

// Utilities
export { 
  enhanceNotification, 
  getActorDisplayName, 
  getNotificationPriority 
} from './utils/formatters';
export { 
  getNavigationForContentType, 
  canNavigateToNotification 
} from './utils/navigationMaps';
