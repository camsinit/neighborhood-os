
/**
 * Helper functions for working with activities
 * Enhanced with better color management and consistency
 */

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
