
import { useState, useCallback } from 'react';

/**
 * Hook to manage neighborhood data refresh functionality
 * 
 * This hook provides functionality to manually refresh neighborhood data
 * and track refresh attempts for debugging purposes.
 * 
 * @returns Object containing refresh state and handler function
 */
export function useNeighborhoodRefresh() {
  // State to track fetch attempts for debugging and manual refresh
  const [fetchAttempts, setFetchAttempts] = useState(0);
  
  // Create a memoized refresh function that can be called from outside components
  const refreshNeighborhoodData = useCallback(() => {
    console.log("[useNeighborhoodRefresh] Manual refresh triggered");
    setFetchAttempts(prev => prev + 1);
  }, []);

  return {
    fetchAttempts,
    refreshNeighborhoodData
  };
}
