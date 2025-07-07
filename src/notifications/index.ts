
/**
 * Clean Notification System Exports
 * 
 * Single entry point for the simplified notification system
 */

// Core hooks
export { useNotifications, useUnreadCount, useNotificationActions } from './useNotifications';

// Components
export { NotificationBell } from './NotificationBell';
export { NotificationPopover } from './NotificationPopover';
export { NotificationDrawer } from './NotificationDrawer';
export { NotificationsList } from './NotificationsList';
export { NotificationItem } from './NotificationItem';

// Types
export type { Notification, NotificationWithProfile } from './types';
