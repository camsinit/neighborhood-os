
/**
 * Types for the Neighborhood context and related functionality
 */

/**
 * Define the structure for a neighborhood
 * This represents a community that users can belong to
 */
export interface Neighborhood {
  id: string;
  name: string;
  created_by: string;
}

/**
 * Define the structure for our context
 * This provides neighborhood data to all components that need it
 */
export interface NeighborhoodContextType {
  currentNeighborhood: Neighborhood | null;
  isLoading: boolean;
  error: Error | null;
  // Fields for God Mode
  isCoreContributor: boolean;
  allNeighborhoods: Neighborhood[];
  setCurrentNeighborhood: (neighborhood: Neighborhood) => void;
  // New field for manually refreshing neighborhood data
  refreshNeighborhoodData: () => void;
}
