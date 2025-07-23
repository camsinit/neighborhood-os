
/**
 * Neighborhood context types
 * 
 * Simplified to support only single neighborhood per user.
 * Removed multiple neighborhood functionality.
 */

// Define the Neighborhood type - includes all database fields
export interface Neighborhood {
  id: string;
  name: string;
  created_by?: string;
  city?: string;
  state?: string;
  timezone?: string;
  invite_header_image_url?: string;
  zip?: string;
  address?: string;
  geo_boundary?: any;
  created_at?: string;
}

// Define the simplified context type - single neighborhood only
export interface NeighborhoodContextType {
  currentNeighborhood: Neighborhood | null;
  isLoading: boolean;
  error: Error | null;
  setCurrentNeighborhood: (neighborhood: Neighborhood | null) => void;
  refreshNeighborhoodData: () => void;
}
