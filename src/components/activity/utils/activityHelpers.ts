
import { 
  Calendar, 
  Shield, 
  Package, 
  Users, 
  Wrench, 
  Heart,
  UserPlus,
  Gift
} from "lucide-react";
import { ActivityType } from "@/hooks/useActivities";
import { getModuleThemeColor } from "@/theme/moduleTheme";

/**
 * Helper functions for activity display
 * Updated to include neighbor_joined and improved goods activity support
 * Now uses proper module theme colors for consistency
 */

/**
 * Gets the appropriate icon for each activity type
 * Now includes support for neighbor_joined and improved goods icons
 */
export const getActivityIcon = (activityType: ActivityType | string) => {
  switch (activityType) {
    // Event activities
    case 'event_created':
    case 'event_rsvp':
      return Calendar;
      
    // Safety activities
    case 'safety_update':
      return Shield;
      
    // Goods activities - improved icon mapping
    case 'good_shared':
      return Gift; // Use Gift icon for shared items (freebies)
    case 'good_requested':
      return Package; // Use Package icon for requested items
      
    // Skills activities
    case 'skill_offered':
    case 'skill_requested':
      return Wrench;
      
    // Care activities
    case 'care_offered':
    case 'care_requested':
      return Heart;
      
    // Neighbor activities - NEW
    case 'neighbor_joined':
      return UserPlus;
    case 'profile_updated':
      return Users;
      
    default:
      return Users; // Default fallback icon
  }
};

/**
 * Gets the appropriate color for each activity type
 * Updated to use module theme colors for consistency across the app
 */
export const getActivityColor = (activityType: ActivityType | string): string => {
  switch (activityType) {
    // Event activities - use calendar theme color
    case 'event_created':
    case 'event_rsvp':
      return getModuleThemeColor('calendar', 'primary');
      
    // Safety activities - use safety theme color
    case 'safety_update':
      return getModuleThemeColor('safety', 'primary');
      
    // Goods activities - use goods theme color (orange)
    case 'good_shared':
    case 'good_requested':
      return getModuleThemeColor('goods', 'primary');
      
    // Skills activities - use skills theme color
    case 'skill_offered':
    case 'skill_requested':
      return getModuleThemeColor('skills', 'primary');
      
    // Care activities - keep pink for now (no specific module)
    case 'care_offered':
    case 'care_requested':
      return '#ec4899'; // Pink
      
    // Neighbor activities - use neighbors theme color
    case 'neighbor_joined':
    case 'profile_updated':
      return getModuleThemeColor('neighbors', 'primary');
      
    default:
      return '#6b7280'; // Gray fallback
  }
};

/**
 * Gets a human-readable description for activity types
 * Updated to include neighbor activities and improved goods descriptions
 */
export const getActivityDescription = (activityType: ActivityType | string): string => {
  switch (activityType) {
    // Event activities
    case 'event_created':
      return 'created an event';
    case 'event_rsvp':
      return 'RSVP\'d to an event';
      
    // Safety activities
    case 'safety_update':
      return 'shared a safety update';
      
    // Goods activities - improved descriptions
    case 'good_shared':
      return 'shared an item';
    case 'good_requested':
      return 'requested an item';
      
    // Skills activities
    case 'skill_offered':
      return 'offered a skill';
    case 'skill_requested':
      return 'requested help with a skill';
      
    // Care activities
    case 'care_offered':
      return 'offered care assistance';
    case 'care_requested':
      return 'requested care assistance';
      
    // Neighbor activities - NEW
    case 'neighbor_joined':
      return 'joined the neighborhood';
    case 'profile_updated':
      return 'updated their profile';
      
    default:
      return 'performed an action';
  }
};
