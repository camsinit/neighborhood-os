
/**
 * Types for the neighborhood hooks
 * 
 * This file defines the common types used throughout the neighborhood-related hooks
 */
import { Neighborhood } from '@/contexts/neighborhood/types';

// Define the return type of the useNeighborhood hook
export interface UseNeighborhoodReturn {
  // Core data
  neighborhood: Neighborhood | null;
  isLoading: boolean;
  error: Error | null;
  
  // Utility functions
  refreshNeighborhood: () => void;
  setCurrentNeighborhood: (neighborhood: Neighborhood) => void;
  
  // Admin/contributor functionality
  isCoreContributor: boolean;
  availableNeighborhoods: Neighborhood[];
  
  // Additional status information
  isBackgroundRefreshing: boolean;
}

// Type for error logging
export interface ErrorLogInfo {
  errorCode?: string;
  errorDetails?: any;
  userId?: string;
  [key: string]: any;
}
