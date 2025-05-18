
/**
 * Helper functions for working with activities
 * Enhanced with better color management and consistency
 */
import { Calendar, Bell, BookOpen, ShoppingBag, Users, Heart } from "lucide-react";

/**
 * Get a consistent color for an activity type
 * Uses the same colors as module theming for consistency
 * 
 * @param activityType The type of activity
 * @returns A CSS color string
 */
export const getActivityColor = (activityType: string): string => {
  switch (activityType) {
    case 'event':
    case 'calendar':
      return '#0EA5E9'; // Calendar blue
    case 'safety':
      return '#EA384C'; // Safety red
    case 'skills':
      return '#22C55E'; // Skills green
    case 'goods':
      return '#F97316'; // Goods orange
    case 'neighbors':
      return '#7E69AB'; // Neighbors purple
    case 'care':
      return '#EC4899'; // Care pink
    default:
      return '#64748B'; // Default slate
  }
};

/**
 * Get the appropriate icon component for an activity type
 * This helps to visually distinguish different activity types
 * 
 * @param activityType The type of activity
 * @returns A Lucide icon component
 */
export const getActivityIcon = (activityType: string) => {
  // Return the appropriate icon component based on activity type
  switch (activityType) {
    case 'event':
    case 'calendar':
      return Calendar; // Calendar icon for events
    case 'safety':
      return Bell; // Bell icon for safety alerts
    case 'skills':
      return BookOpen; // Book icon for skills
    case 'goods':
      return ShoppingBag; // Shopping bag for goods exchange
    case 'neighbors':
      return Users; // Users icon for neighbor activities
    case 'care':
      return Heart; // Heart icon for care activities
    default:
      return Calendar; // Default to calendar icon
  }
};

/**
 * Determine if an activity is recent (within the last 24 hours)
 * 
 * @param timestamp The activity timestamp
 * @returns True if the activity is recent
 */
export const isRecentActivity = (timestamp: string): boolean => {
  const activityDate = new Date(timestamp);
  const now = new Date();
  const hoursDiff = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60);
  return hoursDiff < 24;
};

/**
 * Get a background color for activity items with appropriate opacity
 * 
 * @param activityType The type of activity
 * @param isHighlighted Whether the item is highlighted
 * @returns CSS background color with opacity
 */
export const getActivityBackground = (activityType: string, isHighlighted: boolean = false): string => {
  const baseColor = getActivityColor(activityType);
  const opacity = isHighlighted ? '15' : '08'; // 15% or 8% opacity
  return `${baseColor}${opacity}`;
};

/**
 * Generate a human-readable description from activity metadata
 * This is used to show additional details in the activity sheet
 * 
 * @param metadata The metadata object from the activity
 * @returns A formatted description string
 */
export const getActivityDescription = (metadata: Record<string, any> | null | undefined): string => {
  // If no metadata, return a default message
  if (!metadata) {
    return "No additional details available.";
  }

  // Extract relevant information from metadata based on what's available
  const description = metadata.description || '';
  const location = metadata.location ? `Location: ${metadata.location}` : '';
  const date = metadata.date ? `Date: ${metadata.date}` : '';
  const time = metadata.time ? `Time: ${metadata.time}` : '';
  const category = metadata.category ? `Category: ${metadata.category}` : '';
  
  // Combine the available information with line breaks
  const parts = [description, location, date, time, category].filter(part => part);
  
  // If we have parts, join them; otherwise return default message
  return parts.length > 0 ? parts.join('\n') : "No additional details available.";
};
