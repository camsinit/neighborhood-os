
/**
 * Combined neighborhood utility exports
 * 
 * This file aggregates all neighborhood utility functions for easier importing
 * 
 * SIMPLIFIED VERSION: We've removed duplicate exports to prevent TypeScript errors
 * and make the code more maintainable
 */

// Export membership utilities - this contains the main neighborhood access functions
export * from './neighborhoodMemberUtils';

// Export neighborhood fetch utilities - these include all required access functions
export * from './neighborhoodFetchUtils';

// Legacy function for compatibility - will create RPC functions if needed
export async function createRequiredRPCFunctions(): Promise<void> {
  // This would normally be done in a migration, but we'll add it here as a backup
  console.log("[NeighborhoodUtils] Creating required RPC functions is meant to be done in migrations");
}

// Note: We no longer export from coreContributorUtils directly as these functions
// would conflict with identically named functions in neighborhoodFetchUtils
