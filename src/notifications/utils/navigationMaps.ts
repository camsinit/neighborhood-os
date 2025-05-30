
/**
 * Navigation Mapping Utilities
 * 
 * Maps notification content types to routes and highlight types
 * for seamless smart navigation
 */
import { NavigationMapping } from '../types';

// Content type to navigation mapping
export const CONTENT_TYPE_NAVIGATION: Record<string, NavigationMapping> = {
  'event': {
    route: '/calendar',
    highlightType: 'event'
  },
  'events': {
    route: '/calendar', 
    highlightType: 'event'
  },
  'safety': {
    route: '/safety',
    highlightType: 'safety'
  },
  'safety_updates': {
    route: '/safety',
    highlightType: 'safety'
  },
  'skills': {
    route: '/skills',
    highlightType: 'skills'
  },
  'skill_sessions': {
    route: '/skills',
    highlightType: 'skills'
  },
  'goods': {
    route: '/goods',
    highlightType: 'goods'
  },
  'goods_exchange': {
    route: '/goods',
    highlightType: 'goods'
  },
  'care': {
    route: '/care',
    highlightType: 'neighbors'
  },
  'care_requests': {
    route: '/care',
    highlightType: 'neighbors'
  },
  'neighbors': {
    route: '/neighbors',
    highlightType: 'neighbors'
  },
  'neighbor_welcome': {
    route: '/neighbors',
    highlightType: 'neighbors'
  }
};

/**
 * Get navigation info for a content type
 */
export function getNavigationForContentType(contentType: string): NavigationMapping | null {
  return CONTENT_TYPE_NAVIGATION[contentType] || null;
}

/**
 * Check if a notification supports smart navigation
 */
export function canNavigateToNotification(contentType: string, contentId: string): boolean {
  return Boolean(
    contentType && 
    contentId && 
    CONTENT_TYPE_NAVIGATION[contentType]
  );
}
