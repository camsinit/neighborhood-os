
/**
 * Neighborhood context types
 * 
 * Simplified to support only single neighborhood per user.
 * Removed multiple neighborhood functionality.
 */

// Define the Neighborhood type
export interface Neighborhood {
  id: string;
  name: string;
  created_by?: string; // Added created_by for compatibility with existing code
}

// Define the simplified context type - single neighborhood only
export interface NeighborhoodContextType {
  currentNeighborhood: Neighborhood | null;
  isLoading: boolean;
  error: Error | null;
  setCurrentNeighborhood: (neighborhood: Neighborhood | null) => void;
  refreshNeighborhoodData: () => void;
}
