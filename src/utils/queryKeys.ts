
/**
 * Centralized query key constants for React Query
 * 
 * This file defines standard query keys used throughout the application
 * to ensure consistency and make it easier to invalidate related queries.
 * 
 * Each feature area has its own set of query keys that should be invalidated
 * together when data changes occur.
 */

// Core query keys for major features
export const QUERY_KEYS = {
  // Skills-related queries
  SKILLS: {
    SIMPLIFIED: 'simplified-skills',
    EXCHANGE: 'skills-exchange', 
    PREVIEW: 'skills-preview',
    DUPLICATE_CHECK: 'skill-duplicate-check'
  },
  
  // Goods-related queries
  GOODS: {
    EXCHANGE: 'goods-exchange',
    PREVIEW: 'goods-preview'
  },
  
  // Activity-related queries
  ACTIVITIES: {
    MAIN: 'activities',
    DIRECT: 'activities-direct'
  },
  
  // Event-related queries
  EVENTS: {
    MAIN: 'events',
    RSVPS: 'event-rsvps'
  },
  
  // Safety-related queries
  SAFETY: {
    UPDATES: 'safety-updates'
  },
  
  // Neighbor-related queries
  NEIGHBORS: {
    USERS: 'neighbor-users',
    DIRECTORY: 'user-directory'
  },
  
  // Notification-related queries
  NOTIFICATIONS: {
    MAIN: 'notifications'
  }
} as const;

/**
 * Helper function to get all related query keys for a feature
 * This makes it easy to invalidate all queries when data changes
 */
export const getRelatedQueryKeys = (feature: keyof typeof QUERY_KEYS): string[] => {
  const featureKeys = QUERY_KEYS[feature];
  return Object.values(featureKeys);
};

/**
 * Helper function to invalidate all queries related to activities
 * Activities are affected by changes in most other features
 */
export const getActivityRelatedKeys = (): string[] => {
  return [
    QUERY_KEYS.ACTIVITIES.MAIN,
    QUERY_KEYS.ACTIVITIES.DIRECT
  ];
};

/**
 * Helper function to get all query keys that should be invalidated
 * when a specific feature changes (including activities)
 */
export const getInvalidationKeys = (feature: keyof typeof QUERY_KEYS): string[] => {
  const featureKeys = getRelatedQueryKeys(feature);
  const activityKeys = getActivityRelatedKeys();
  
  // Return unique keys (avoid duplicates if feature is already activities)
  return [...new Set([...featureKeys, ...activityKeys])];
};
