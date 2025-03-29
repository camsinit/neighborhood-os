
/**
 * Combined neighborhood utility exports
 * 
 * This file aggregates all neighborhood utility functions for easier importing
 */

// Export membership utilities
export * from './neighborhoodMemberUtils';

// Export core contributor utilities
export * from './coreContributorUtils';

// Export neighborhood fetch utilities
export * from './neighborhoodFetchUtils';

// Legacy function for compatibility - will create RPC functions if needed
export async function createRequiredRPCFunctions(): Promise<void> {
  // This would normally be done in a migration, but we'll add it here as a backup
  console.log("[NeighborhoodUtils] Creating required RPC functions is meant to be done in migrations");
}
