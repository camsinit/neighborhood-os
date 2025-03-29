/**
 * Types for the neighborhood context and related functions
 */

// Basic neighborhood data structure
export interface Neighborhood {
  id: string;
  name: string;
  // Other fields that might be present but not required for basic functionality
  created_by?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

// Type for the neighborhood context
export interface NeighborhoodContextType {
  // Current selected neighborhood
  currentNeighborhood: Neighborhood | null;
  
  // Loading and error states
  isLoading: boolean;
  error: Error | null;
  
  // Core contributor status (for "God Mode")
  isCoreContributor: boolean;
  
  // All available neighborhoods for this user
  allNeighborhoods: Neighborhood[];
  
  // Function to change the selected neighborhood
  setCurrentNeighborhood: (neighborhood: Neighborhood) => void;
  
  // Function to manually refresh neighborhood data
  refreshNeighborhoodData: () => void;
}
