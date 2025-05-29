
/**
 * Main exports for the notifications module
 * Updated to reflect the universal notification pathway
 */

// Main components
export { NotificationsSection } from './NotificationsSection';
export { default as NotificationDrawer } from './NotificationDrawer';
export { default as NotificationPopover } from './NotificationsPopover'; 
export { default as NotificationsPopover } from './NotificationsPopover'; 

// Universal notification item (replaces all specialized components)
export { default as NotificationItem } from './NotificationItem';

// Section components
export { default as NotificationGroup } from './sections/NotificationGroup';

// State components
export { NotificationsLoadingState, NotificationsEmptyState } from './states/NotificationStates';

// Action components
export { default as MarkAllAsReadButton } from './actions/MarkAllAsReadButton';

// Utility functions
export * from './utils/notificationGroupingUtils';
