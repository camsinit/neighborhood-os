
/**
 * Neighborhood data types
 */

// Neighborhood type
export interface Neighborhood {
  id: string; 
  name: string;
  created_by?: string;
  created_at?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  joined_at?: string; // Added to accommodate data returned from get_user_neighborhoods
}

// Neighborhood context type
export interface NeighborhoodContextType {
  currentNeighborhood: Neighborhood | null;
  isLoading: boolean;
  error: Error | null;
  allNeighborhoods: Neighborhood[];
  setCurrentNeighborhood: (neighborhood: Neighborhood) => void;
  refreshNeighborhoodData: () => void; // Added this function type
}
