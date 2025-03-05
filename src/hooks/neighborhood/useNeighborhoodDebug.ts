
/**
 * Hook for debugging neighborhood data
 * 
 * This hook encapsulates all the debugging and logging functionality
 * for neighborhood data
 */
import { useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '@/contexts/neighborhood/types';

/**
 * Hook for logging neighborhood state changes
 * 
 * @param state - Current neighborhood state
 */
export const useNeighborhoodDebug = (state: {
  neighborhood: Neighborhood | null;
  isLoading: boolean;
  error: Error | null;
  isCoreContributor: boolean;
  availableNeighborhoods: Neighborhood[];
  user: User | null;
  isRefetching: boolean;
  isBackgroundRefreshing: boolean;
}) => {
  const { 
    neighborhood, 
    isLoading, 
    error, 
    isCoreContributor, 
    availableNeighborhoods, 
    user,
    isRefetching,
    isBackgroundRefreshing
  } = state;

  // Log state changes for debugging
  useEffect(() => {
    console.log("[useNeighborhood] Current neighborhood state:", {
      neighborhoodId: neighborhood?.id,
      neighborhoodName: neighborhood?.name,
      isLoading,
      isCoreContributor,
      availableNeighborhoodCount: availableNeighborhoods?.length || 0,
      hasError: !!error,
      userId: user?.id,
      isRefetching,
      isBackgroundRefreshing
    });
  }, [neighborhood, isLoading, isCoreContributor, availableNeighborhoods, error, user, isRefetching, isBackgroundRefreshing]);
};
