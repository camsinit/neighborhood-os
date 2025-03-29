
/**
 * Neighborhood context module
 * 
 * This module provides access to neighborhood data and functionality
 * throughout the application.
 */

// Export the provider and hook
export { NeighborhoodProvider, useNeighborhood } from './NeighborhoodProvider';

// Export types
export type { Neighborhood, NeighborhoodContextType } from './types';

// Export utility functions for direct access if needed
export * from './utils';
