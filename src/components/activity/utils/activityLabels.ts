
/**
 * Utility functions for activity labels
 * Enhanced to better derive activity actions from various data sources
 */
// Fix import to use the correct path for HighlightableItemType
import { type HighlightableItemType } from '@/utils/highlight/types';
import { getActivityColor } from './activityHelpers';

// Activity action types - these represent the different actions that can be taken on items
export type ActivityAction = 
  // Event actions
  'create' | 'update' | 'rsvp' | 'cancel' | 
  // Safety actions
  'report' | 'comment' | 
  // Skills actions
  'offer' | 'request' | 'match' | 'complete' | 'schedule' | 
  // Goods actions
  'claim' |
  // Neighbor actions
  'join' | 'invite' | 'welcome';

/**
 * Get a human-readable label for activity badges
 * This provides a basic label when more specific context isn't available
 * 
 * @param activityType - The general activity type (event, safety, etc.)
 * @returns A simple human-readable activity label
 */
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
 * Attempts to derive the action from a title string based on common patterns
 * This is a fallback when the action isn't explicitly provided in metadata
 * 
 * @param title - The activity title to analyze
 * @param activityType - The activity type for context
 * @returns The derived action or undefined if no pattern matches
 */
export const deriveActionFromTitle = (title: string, activityType: string): ActivityAction | undefined => {
  // Convert to lowercase for case-insensitive matching
  const lowerTitle = title.toLowerCase();
  
  // Check for common patterns in titles
  if (activityType === 'event') {
    if (lowerTitle.includes('created') || lowerTitle.includes('scheduled') || lowerTitle.includes('new event')) {
      return 'create';
    } else if (lowerTitle.includes('updated') || lowerTitle.includes('changed')) {
      return 'update';
    } else if (lowerTitle.includes('rsvp') || lowerTitle.includes('attending') || lowerTitle.includes('joined')) {
      return 'rsvp';
    } else if (lowerTitle.includes('cancel')) {
      return 'cancel';
    }
  } else if (activityType === 'safety') {
    if (lowerTitle.includes('reported') || lowerTitle.includes('alert')) {
      return 'report';
    } else if (lowerTitle.includes('comment') || lowerTitle.includes('responded')) {
      return 'comment';
    }
  } else if (activityType === 'skills') {
    if (lowerTitle.includes('offering') || lowerTitle.includes('can help')) {
      return 'offer';
    } else if (lowerTitle.includes('needs help') || lowerTitle.includes('requesting')) {
      return 'request';
    } else if (lowerTitle.includes('matched') || lowerTitle.includes('found')) {
      return 'match';
    } else if (lowerTitle.includes('completed') || lowerTitle.includes('finished')) {
      return 'complete';
    } else if (lowerTitle.includes('scheduled') || lowerTitle.includes('appointment')) {
      return 'schedule';
    }
  } else if (activityType === 'goods') {
    if (lowerTitle.includes('offering') || lowerTitle.includes('available')) {
      return 'offer';
    } else if (lowerTitle.includes('needs') || lowerTitle.includes('looking for')) {
      return 'request';
    } else if (lowerTitle.includes('claimed') || lowerTitle.includes('taken')) {
      return 'claim';
    }
  } else if (activityType === 'neighbors') {
    if (lowerTitle.includes('joined') || lowerTitle.includes('new neighbor')) {
      return 'join';
    } else if (lowerTitle.includes('invited')) {
      return 'invite';
    }
  }
  
  // No pattern matched
  return undefined;
};

/**
 * Attempts to derive the action from metadata properties
 * Different activity sources might store action-related information in different metadata fields
 * 
 * @param metadata - The metadata object to analyze
 * @returns The derived action or undefined if no relevant properties found
 */
export const deriveActionFromMetadata = (metadata?: Record<string, any>): ActivityAction | undefined => {
  if (!metadata) return undefined;
  
  // Check for common metadata properties that might indicate actions
  if (metadata.action) {
    return metadata.action as ActivityAction;
  } else if (metadata.contextType) {
    // Some notifications use contextType for action info
    if (metadata.contextType === 'event_create') return 'create';
    if (metadata.contextType === 'event_update') return 'update';
    if (metadata.contextType === 'event_rsvp') return 'rsvp';
    if (metadata.contextType === 'safety_alert') return 'report';
    if (metadata.contextType === 'safety_comment') return 'comment';
    if (metadata.contextType === 'skill_offer') return 'offer';
    if (metadata.contextType === 'skill_request') return 'request';
  } else if (metadata.type) {
    // Some activities use type for action info
    if (metadata.type === 'create') return 'create';
    if (metadata.type === 'update') return 'update';
    if (metadata.type === 'rsvp') return 'rsvp';
    if (metadata.type === 'offer') return 'offer';
    if (metadata.type === 'request') return 'request';
  } else if (metadata.operation_type) {
    // Database triggers might use operation_type
    if (metadata.operation_type === 'INSERT') return 'create';
    if (metadata.operation_type === 'UPDATE') return 'update';
    if (metadata.operation_type === 'DELETE') return 'cancel';
  }
  
  return undefined;
};

/**
 * Get a more detailed activity label based on activity type and context
 * This provides more specific labels about what happened with the item
 * Enhanced to derive actions from multiple sources when not explicitly provided
 * 
 * @param activityType - The type of activity (event, safety, skills, etc.)
 * @param action - The explicit action taken (created, updated, etc.) if available
 * @param title - Optional title text that might contain action hints
 * @param metadata - Optional metadata that might contain action hints
 * @returns A detailed human-readable activity label
 */
export const getDetailedActivityLabel = (
  activityType: string, 
  action?: string, 
  title?: string,
  metadata?: Record<string, any>
): string => {
  // Try to get action from the explicit action parameter first
  let derivedAction = action as ActivityAction | undefined;
  
  // If no explicit action, try to derive it from metadata
  if (!derivedAction && metadata) {
    derivedAction = deriveActionFromMetadata(metadata);
  }
  
  // If still no action, try to derive it from the title
  if (!derivedAction && title) {
    derivedAction = deriveActionFromTitle(title, activityType);
  }
  
  // If we have a derived action, use it to create a detailed label
  if (derivedAction) {
    // Create a more descriptive label based on activity type and derived action
    switch (activityType) {
      case 'event':
        switch (derivedAction) {
          case 'create': return 'Event Created';
          case 'update': return 'Event Updated';
          case 'rsvp': return 'Event RSVP';
          case 'cancel': return 'Event Cancelled';
          default: return 'Event Activity';
        }
      
      case 'safety':
        switch (derivedAction) {
          case 'report': return 'Safety Alert';
          case 'update': return 'Safety Updated';
          case 'comment': return 'Safety Comment';
          default: return 'Safety Update';
        }
      
      case 'skills':
        switch (derivedAction) {
          case 'offer': return 'Skill Offered';
          case 'request': return 'Skill Requested';
          case 'update': return 'Skill Updated';
          case 'match': return 'Skill Matched';
          case 'complete': return 'Skill Completed';
          case 'schedule': return 'Session Scheduled';
          default: return 'Skill Activity';
        }
      
      case 'goods':
        switch (derivedAction) {
          case 'offer': return 'Goods Offered';
          case 'request': return 'Goods Needed';
          case 'update': return 'Goods Updated';
          case 'claim': return 'Goods Claimed';
          default: return 'Goods Activity';
        }
      
      case 'neighbors':
        switch (derivedAction) {
          case 'join': return 'Neighbor Joined';
          case 'update': return 'Profile Updated';
          case 'invite': return 'Neighbor Invited';
          case 'welcome': return 'Welcome Message';
          default: return 'Neighborhood Activity';
        }
    }
  }
  
  // If we couldn't derive an action, fall back to the basic label
  return getActivityBadgeLabel(activityType);
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
