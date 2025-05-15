
/**
 * Utility functions for activity badge labels and type mapping
 */
import { HighlightableItemType } from '@/utils/highlight';

/**
 * Get a concise action description for the activity badge
 * This maps activity types to short, action-focused labels
 * 
 * @param activityType - The type of activity
 * @returns A short, descriptive label for the activity badge
 */
export const getActivityBadgeLabel = (activityType: string): string => {
  switch (activityType) {
    // Event activities
    case 'event_created':
      return 'New Event';
    case 'event_rsvp':
      return 'Event RSVP';
      
    // Skill activities
    case 'skill_offered':
      return 'Skill Offered';
    case 'skill_requested':
      return 'Skill Request';
      
    // Goods activities  
    case 'good_shared':
      return 'Item Shared';
    case 'good_requested':
      return 'Item Request';
      
    // Safety activities
    case 'safety_update':
      return 'Safety Update';
      
    default:
      return 'Update';
  }
};

/**
 * Maps activity type to highlightable item type
 * 
 * @param activityType - The activity type from the database
 * @returns The corresponding highlighting item type
 */
export const getHighlightableItemType = (activityType: string): HighlightableItemType => {
  // Extract the base type from activity_type (e.g., skill_offered → skills)
  const baseType = activityType.split('_')[0];
  
  // Map to our standard item types
  switch (baseType) {
    case 'skill': return 'skills';
    case 'event': return 'event';
    case 'good': return 'goods';
    case 'safety': return 'safety';
    default: return 'event'; // Default fallback
  }
};
