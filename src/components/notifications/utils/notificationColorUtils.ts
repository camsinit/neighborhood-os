
/**
 * Utility functions for notification color schemes
 * Provides consistent color values across notification components
 */
import { moduleThemeColors } from "@/theme/moduleTheme";

/**
 * Returns the appropriate text color class for a notification type
 * 
 * @param notificationType The type of notification (event, skills, etc)
 * @returns Tailwind class for text color
 */
export const getNotificationTextColor = (notificationType?: string): string => {
  if (!notificationType) return "text-indigo-500";
  
  const type = notificationType.toLowerCase();
  
  // Map notification types to color classes
  if (type.includes('event') || type.includes('calendar')) {
    return "text-blue-600"; // Calendar blue
  }
  if (type.includes('skill')) {
    return "text-indigo-500"; // Skills purple
  }
  if (type.includes('good')) {
    return "text-emerald-600"; // Goods green
  }
  if (type.includes('safety')) {
    return "text-amber-600"; // Safety amber
  }
  if (type.includes('neighbor')) {
    return "text-violet-600"; // Neighbors violet
  }
  
  // Default color
  return "text-indigo-500";
};

/**
 * Returns the appropriate background color class for a notification type
 * (for avatars, badges, etc.)
 * 
 * @param notificationType The type of notification
 * @returns Tailwind class for background color
 */
export const getNotificationBgColor = (notificationType?: string): string => {
  if (!notificationType) return "bg-indigo-500";
  
  const type = notificationType.toLowerCase();
  
  // Map notification types to color classes
  if (type.includes('event') || type.includes('calendar')) {
    return "bg-blue-500"; // Calendar blue
  }
  if (type.includes('skill')) {
    return "bg-indigo-500"; // Skills purple
  }
  if (type.includes('good')) {
    return "bg-emerald-500"; // Goods green
  }
  if (type.includes('safety')) {
    return "bg-amber-500"; // Safety amber
  }
  if (type.includes('neighbor')) {
    return "bg-violet-500"; // Neighbors violet
  }
  
  // Default color
  return "bg-indigo-500";
};

/**
 * Returns the appropriate hover background color class for a notification type
 * (for buttons and interactive elements)
 * 
 * @param notificationType The type of notification
 * @returns Tailwind class for hover background
 */
export const getNotificationHoverBgColor = (notificationType?: string): string => {
  if (!notificationType) return "hover:bg-indigo-50";
  
  const type = notificationType.toLowerCase();
  
  // Map notification types to hover color classes
  if (type.includes('event') || type.includes('calendar')) {
    return "hover:bg-blue-50"; // Calendar blue
  }
  if (type.includes('skill')) {
    return "hover:bg-indigo-50"; // Skills purple
  }
  if (type.includes('good')) {
    return "hover:bg-emerald-50"; // Goods green
  }
  if (type.includes('safety')) {
    return "hover:bg-amber-50"; // Safety amber
  }
  if (type.includes('neighbor')) {
    return "hover:bg-violet-50"; // Neighbors violet
  }
  
  // Default color
  return "hover:bg-indigo-50";
};

/**
 * Returns the appropriate border color class for a notification
 * (for the left border accent)
 * 
 * @param notificationType The type of notification
 * @returns Tailwind class for border color
 */
export const getNotificationBorderColor = (notificationType?: string): string => {
  if (!notificationType) return "border-l-indigo-500";
  
  const type = notificationType.toLowerCase();
  
  // Map notification types to border color classes
  if (type.includes('event') || type.includes('calendar')) {
    return "border-l-blue-500"; // Calendar blue
  }
  if (type.includes('skill')) {
    return "border-l-indigo-500"; // Skills purple
  }
  if (type.includes('good')) {
    return "border-l-emerald-500"; // Goods green
  }
  if (type.includes('safety')) {
    return "border-l-amber-500"; // Safety amber
  }
  if (type.includes('neighbor')) {
    return "border-l-violet-500"; // Neighbors violet
  }
  
  // Default color
  return "border-l-indigo-500";
};
