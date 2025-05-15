
/**
 * notificationColorUtils.ts
 * 
 * Utility functions to provide consistent colors for notifications
 */

/**
 * Get the appropriate border color class for a notification type
 */
export const getNotificationBorderColor = (notificationType?: string): string => {
  switch (notificationType) {
    case 'event':
      return 'border-[#4FD1C5]';
    case 'skills':
      return 'border-[#6366F1]';
    case 'goods':
      return 'border-[#F59E0B]';
    case 'safety':
      return 'border-[#EF4444]';
    case 'neighbor_welcome':
    case 'neighbors':
      return 'border-[#10B981]';
    case 'care':
      return 'border-[#EC4899]';
    default:
      return 'border-gray-200';
  }
};

/**
 * Get the appropriate text color for notification content
 */
export const getNotificationTextColor = (contentType?: string): string => {
  switch (contentType) {
    case 'event':
    case 'calendar':
      return 'text-[#38B2AC]';
    case 'skills':
      return 'text-[#4F46E5]';
    case 'goods':
      return 'text-[#D97706]';
    case 'safety':
      return 'text-[#DC2626]';
    case 'neighbor_welcome':
    case 'neighbors':
      return 'text-[#059669]';
    case 'care':
      return 'text-[#DB2777]';
    default:
      return 'text-primary';
  }
};
