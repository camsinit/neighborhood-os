
/**
 * Exports all notification element components for easy imports
 */

export { default as NotificationAvatar } from './NotificationAvatar';
export { default as NotificationBadge } from './NotificationBadge';
export { default as NotificationIcon } from './NotificationIcon';
export { default as NotificationTimeStamp } from './NotificationTimeStamp';
export { default as NotificationContent } from './NotificationContent';
export { default as NotificationActions } from './NotificationActions';
export { default as NotificationDescription } from './NotificationDescription';

// Export types from their respective files
// Note: We're removing these direct type exports to fix the build error
// These types should be imported directly from their source files when needed
