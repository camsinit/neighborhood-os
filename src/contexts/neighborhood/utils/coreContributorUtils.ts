
/**
 * Utility functions for core contributor operations
 * 
 * This file has been simplified to completely disable core contributor functionality.
 * All functions will return default values that effectively disable the feature.
 */

// This function now always returns false to disable the core contributor check
export async function checkCoreContributorAccess(userId: string): Promise<boolean> {
  // Simplified implementation: always return false
  console.info("[NeighborhoodUtils] Core contributor functionality has been disabled");
  return false;
}

// This function now returns an empty array to disable neighborhood fetching
export async function fetchAllNeighborhoodsForCoreContributor(userId: string): Promise<any[]> {
  // Simplified implementation: return empty array
  console.info("[NeighborhoodUtils] Core contributor functionality has been disabled");
  return [];
}
