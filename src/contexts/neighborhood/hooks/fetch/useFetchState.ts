
/**
 * Hook to manage fetch state for neighborhood data
 * 
 * This module handles state management for the neighborhood fetch process
 */
import { useState } from 'react';
import { Neighborhood } from '../../types';

/**
 * Interface for fetch state hook return value
 */
export interface UseFetchStateReturn {
  error: Error | null;
  hasFetchAttempted: boolean;
  setError: (error: Error | null) => void;
  setHasFetchAttempted: (value: boolean) => void;
  resetStates: (
    setIsLoading: (loading: boolean) => void,
    setIsCoreContributor: (isCore: boolean) => void,
    setAllNeighborhoods: (neighborhoods: Neighborhood[]) => void
  ) => void;
}

/**
 * Hook to manage fetch state
 * 
 * @returns State management functions and values
 */
export const useFetchState = (): UseFetchStateReturn => {
  // State for error handling
  const [error, setError] = useState<Error | null>(null);
  
  // State to track if we have attempted a fetch
  const [hasFetchAttempted, setHasFetchAttempted] = useState(false);
  
  // Function to reset states at the start of each fetch
  const resetStates = (
    setIsLoading: (loading: boolean) => void,
    setIsCoreContributor: (isCore: boolean) => void,
    setAllNeighborhoods: (neighborhoods: Neighborhood[]) => void
  ) => {
    setError(null);
    setIsLoading(true);
    setIsCoreContributor(false);
    setAllNeighborhoods([]);
    setHasFetchAttempted(true); // Mark that we have attempted a fetch
  };
  
  return {
    error,
    hasFetchAttempted,
    setError,
    setHasFetchAttempted,
    resetStates
  };
};
