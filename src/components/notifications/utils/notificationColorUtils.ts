
/**
 * Utility functions for determining notification styling 
 * based on notification types
 */

/**
 * Get the appropriate border color class based on notification type
 * 
 * @param notificationType The type of notification
 * @returns Tailwind CSS class for the left border color
 */
export const getNotificationBorderColor = (notificationType: string | undefined): string => {
  // Handle undefined or null notification types with a default
  if (!notificationType) {
    return "border-l-gray-500";
  }
  
  // Convert notification_type to a string and lowercase for consistent matching
  const type = String(notificationType).toLowerCase();
  
  // Match known types or default to gray
  switch (type) {
    case "event":
      return "border-l-blue-500";
    case "safety":
      return "border-l-red-500";
    case "skills":
      return "border-l-green-500";
    case "neighbors":
      return "border-l-purple-500";
    case "goods":
      return "border-l-amber-500";
    case "support":
      return "border-l-indigo-500";
    default:
      return "border-l-gray-500";
  }
};

/**
 * Get the text color class for a notification type
 * Useful for highlighting specific content in notifications
 * 
 * @param notificationType The type of notification
 * @returns Tailwind CSS class for text color
 */
export const getNotificationTextColor = (notificationType: string | undefined): string => {
  // Handle undefined or null notification types with a default
  if (!notificationType) {
    return "text-gray-700";
  }
  
  // Convert notification_type to a string and lowercase for consistent matching
  const type = String(notificationType).toLowerCase();
  
  // Match known types to their text colors
  switch (type) {
    case "event":
      return "text-blue-700";
    case "safety":
      return "text-red-700";
    case "skills":
      return "text-green-700";
    case "neighbors":
      return "text-purple-700";
    case "goods":
      return "text-amber-700";
    case "support":
      return "text-indigo-700";
    default:
      return "text-gray-700";
  }
};
