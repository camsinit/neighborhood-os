
/**
 * Index file for the neighborhood hooks
 * 
 * This file exports all the neighborhood hooks and types for easy importing
 */

// Re-export the main hook and its types
export { default as useNeighborhood } from '../useNeighborhood';
export type { UseNeighborhoodReturn } from './types';

// Export utility hooks for direct use if needed
export { useNeighborhoodQueries } from './useNeighborhoodQueries';
export { useBackgroundRefresh } from './useBackgroundRefresh';
export { useNeighborhoodDebug } from './useNeighborhoodDebug';

// Export utility functions if needed by other components
export { 
  checkCoreContributorStatus,
  fetchCreatedNeighborhoods,
  fetchNeighborhoodMembership,
  fetchAllNeighborhoodsForContributor 
} from './utils/fetchers';
