
/**
 * useNeighborhood Hook
 * 
 * This hook serves as the primary interface for accessing neighborhood data throughout the application.
 * It provides a simplified API for fetching, updating, and managing neighborhood information.
 * 
 * @returns Object containing neighborhood data and utility functions
 */
import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';
import { UseNeighborhoodReturn } from './neighborhood/types';
import { useNeighborhoodQueries } from './neighborhood/useNeighborhoodQueries';
import { useBackgroundRefresh } from './neighborhood/useBackgroundRefresh';
import { useNeighborhoodDebug } from './neighborhood/useNeighborhoodDebug';

// Re-export the type so components can import it directly from useNeighborhood
export type { UseNeighborhoodReturn } from './neighborhood/types';

/**
 * Custom hook for working with neighborhood data
 * 
 * This simplified hook centralizes neighborhood fetching logic
 * and provides a clean interface for components to use.
 */
export function useNeighborhood(): UseNeighborhoodReturn {
  // Get the current authenticated user
  const user = useUser();
  
  // Local state for error tracking
  const [error, setError] = useState<Error | null>(null);
  
  // Get all neighborhood queries
  const {
    neighborhoodQuery,
    availableNeighborhoodsQuery,
    setCurrentNeighborhoodMutation
  } = useNeighborhoodQueries();
  
  // Extract query data
  const {
    data: neighborhoodData,
    isLoading,
    refetch,
    isRefetching
  } = neighborhoodQuery;
  
  const availableNeighborhoods = availableNeighborhoodsQuery.data || [];
  
  // Set up background refresh
  const { isBackgroundRefreshing, backgroundRefresh } = useBackgroundRefresh(
    refetch,
    availableNeighborhoodsQuery.refetch
  );
  
  // Log debugging information
  useNeighborhoodDebug({
    neighborhood: neighborhoodData || null,
    isLoading,
    error,
    availableNeighborhoods,
    user,
    isRefetching,
    isBackgroundRefreshing
  });

  // Handle errors from the main neighborhood query
  useEffect(() => {
    if (neighborhoodQuery.error) {
      setError(neighborhoodQuery.error as Error);
      console.error("[useNeighborhood] Error fetching neighborhood:", neighborhoodQuery.error);
      
      // Show toast notification for user feedback
      toast.error("Unable to load neighborhood data", {
        description: "Please try refreshing the page or contact support if the problem persists.",
        duration: 5000
      });
    }
  }, [neighborhoodQuery.error]);

  // Return a cleaned-up, simple interface
  return {
    neighborhood: neighborhoodData || null,
    isLoading,
    error,
    refreshNeighborhood: backgroundRefresh,
    setCurrentNeighborhood: setCurrentNeighborhoodMutation.mutate,
    availableNeighborhoods,
    isBackgroundRefreshing
  };
}

// Export a convenient alias for the hook
export default useNeighborhood;
