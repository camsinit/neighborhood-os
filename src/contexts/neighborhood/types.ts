
/**
 * Neighborhood context types
 * 
 * This file has been simplified to remove core contributor functionality.
 */

// Define the Neighborhood type
export interface Neighborhood {
  id: string;
  name: string;
  created_by?: string; // Added created_by for compatibility with existing code
}

// Define the context type
export interface NeighborhoodContextType {
  currentNeighborhood: Neighborhood | null;
  isLoading: boolean;
  error: Error | null;
  // Removed isCoreContributor and allNeighborhoods
  setCurrentNeighborhood: (neighborhood: Neighborhood | null) => void;
  refreshNeighborhoodData: () => void;
}
