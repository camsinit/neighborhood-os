
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
import { ActivityType } from "@/utils/queries/useActivities";

/**
 * Helper functions for activity display
 * Updated to include neighbor_joined and improved goods activity support
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
 * Updated to include neighbor activities and improved goods colors
 */
export const getActivityColor = (activityType: ActivityType | string): string => {
  switch (activityType) {
    // Event activities
    case 'event_created':
    case 'event_rsvp':
      return '#3b82f6'; // Blue
      
    // Safety activities
    case 'safety_update':
      return '#ef4444'; // Red
      
    // Goods activities - improved color scheme
    case 'good_shared':
      return '#10b981'; // Green for shared items (positive action)
    case 'good_requested':
      return '#f59e0b'; // Amber for requested items (need)
      
    // Skills activities
    case 'skill_offered':
      return '#8b5cf6'; // Purple
    case 'skill_requested':
      return '#a855f7'; // Purple variant
      
    // Care activities
    case 'care_offered':
    case 'care_requested':
      return '#ec4899'; // Pink
      
    // Neighbor activities - NEW
    case 'neighbor_joined':
      return '#059669'; // Emerald green (welcoming)
    case 'profile_updated':
      return '#6366f1'; // Indigo
      
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
