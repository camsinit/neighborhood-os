
/**
 * Utility functions for activity labels
 */
// Fix import to use the correct path for HighlightableItemType
import { type HighlightableItemType } from '@/utils/highlight/types';
import { getActivityColor } from './activityHelpers';

// Get a human-readable label for activity badges
export const getActivityBadgeLabel = (activityType: string): string => {
  switch (activityType) {
    case 'event':
      return 'Event';
    case 'safety':
      return 'Safety Update';
    case 'skills':
      return 'Skill Request';
    case 'goods':
      return 'Goods Request';
    case 'neighbors':
      return 'New Neighbor';
    default:
      return 'Activity';
  }
};

/**
 * Get a more detailed activity label based on both activity type and action
 * This provides more specific context about what happened with the item
 * 
 * @param activityType - The type of activity (event, safety, skills, etc.)
 * @param action - The specific action taken (created, updated, etc.)
 * @returns A detailed human-readable activity label
 */
export const getDetailedActivityLabel = (activityType: string, action?: string): string => {
  // If no action is provided, default to the basic label
  if (!action) {
    return getActivityBadgeLabel(activityType);
  }

  // Create a more descriptive label based on activity type and action
  switch (activityType) {
    case 'event':
      switch (action) {
        case 'create': return 'Event Created';
        case 'update': return 'Event Updated';
        case 'rsvp': return 'Event RSVP';
        case 'cancel': return 'Event Cancelled';
        default: return 'Event';
      }
    
    case 'safety':
      switch (action) {
        case 'create': return 'Safety Alert';
        case 'update': return 'Safety Updated';
        case 'comment': return 'Safety Comment';
        default: return 'Safety Update';
      }
    
    case 'skills':
      switch (action) {
        case 'offer': return 'Skill Offered';
        case 'request': return 'Skill Requested';
        case 'update': return 'Skill Updated';
        case 'match': return 'Skill Matched';
        case 'complete': return 'Skill Completed';
        default: return 'Skill Activity';
      }
    
    case 'goods':
      switch (action) {
        case 'offer': return 'Goods Offered';
        case 'request': return 'Goods Needed';
        case 'update': return 'Goods Updated';
        case 'claim': return 'Goods Claimed';
        default: return 'Goods Activity';
      }
    
    case 'neighbors':
      switch (action) {
        case 'join': return 'Neighbor Joined';
        case 'update': return 'Profile Updated';
        case 'invite': return 'Neighbor Invited';
        default: return 'Neighborhood Activity';
      }
      
    default:
      return getActivityBadgeLabel(activityType);
  }
};

// Get module path for highlighting
export const getActivityHighlightType = (activityType: string): HighlightableItemType | undefined => {
  // Map activity types to highlight types
  switch (activityType) {
    case 'event':
    case 'safety':
    case 'skills':
    case 'goods':
    case 'neighbors':
      return activityType as HighlightableItemType;
    default:
      return undefined;
  }
};
