
/**
 * Hook for background refresh functionality
 * 
 * This hook manages the background refresh logic for neighborhood data
 */
import { useState } from 'react';

/**
 * Custom hook to handle background refreshes
 * @param refetchNeighborhood - Function to refetch the current neighborhood
 * @param refetchAvailable - Function to refetch available neighborhoods
 * @returns Object with refresh functions and state
 */
export function useBackgroundRefresh(
  refetchNeighborhood: () => void,
  refetchAvailable: () => void
) {
  // Track if we're currently doing a background refresh
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);
  
  // Function to refresh both neighborhood data and available neighborhoods
  const backgroundRefresh = async () => {
    setIsBackgroundRefreshing(true);
    
    try {
      // Refetch both in parallel
      await Promise.all([
        refetchNeighborhood(),
        refetchAvailable()
      ]);
    } catch (error) {
      console.error("[useBackgroundRefresh] Error during background refresh:", error);
    } finally {
      setIsBackgroundRefreshing(false);
    }
  };
  
  return {
    isBackgroundRefreshing,
    backgroundRefresh
  };
}

export default useBackgroundRefresh;
