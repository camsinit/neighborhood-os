
/**
 * Combined neighborhood utility exports
 * 
 * This file aggregates all neighborhood utility functions for easier importing
 * across the application.
 * 
 * SIMPLIFIED VERSION: Removed duplicate exports to prevent TypeScript errors
 */

// Export membership utilities - this contains the main neighborhood access functions
export * from './neighborhoodMemberUtils';

// Export neighborhood fetch utilities - these include all security definer function access
export * from './neighborhoodFetchUtils';

// Legacy function for compatibility - will create RPC functions if needed
export async function createRequiredRPCFunctions(): Promise<void> {
  // This would normally be done in a migration, but we'll add it here as a backup
  console.log("[NeighborhoodUtils] Creating required RPC functions is meant to be done in migrations");
}

// Note: We're not exporting from coreContributorUtils directly anymore to avoid
// duplicate export conflicts, since these functions are now exported through neighborhoodFetchUtils
