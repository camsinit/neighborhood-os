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
