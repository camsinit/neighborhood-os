
/**
 * Neighborhood data types
 */

// Neighborhood type
export interface Neighborhood {
  id: string; 
  name: string;
  created_by?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

// Neighborhood context type
export interface NeighborhoodContextType {
  currentNeighborhood: Neighborhood | null;
  isLoading: boolean;
  error: Error | null;
  isCoreContributor: boolean;
  allNeighborhoods: Neighborhood[];
  setCurrentNeighborhood: (neighborhood: Neighborhood) => void;
  refreshNeighborhoodData: () => void; // Added this function type
}
