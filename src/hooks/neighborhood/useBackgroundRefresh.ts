
/**
 * Hook for background refreshing of neighborhood data
 * 
 * This hook provides functionality to refresh neighborhood data in the background
 * without disrupting the user experience
 */
import { useState, useCallback, useEffect } from 'react';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { logDebug } from './utils/errorLogging';
import { Neighborhood } from '@/contexts/neighborhood/types';

/**
 * Hook to manage background refresh of neighborhood data
 * 
 * @param refetch - Refetch function from React Query
 * @param refetchAvailableNeighborhoods - Function to refetch available neighborhoods
 * @param isCoreContributor - Whether the user is a core contributor
 * @returns Object containing background refresh state and functions
 */
export const useBackgroundRefresh = (
  refetch: (options?: RefetchOptions) => Promise<QueryObserverResult>,
  refetchAvailableNeighborhoods: (options?: RefetchOptions) => Promise<QueryObserverResult>,
  isCoreContributor: boolean
) => {
  // Track if a background refresh is happening
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);

  // Background refresh function that doesn't trigger loading state
  const backgroundRefresh = useCallback(async () => {
    if (isBackgroundRefreshing) return;
    
    setIsBackgroundRefreshing(true);
    logDebug("Starting background refresh");
    
    try {
      await refetch({ cancelRefetch: false });
      if (isCoreContributor) {
        await refetchAvailableNeighborhoods({ cancelRefetch: false });
      }
      logDebug("Background refresh completed successfully");
    } catch (err) {
      console.error("[useNeighborhood] Background refresh failed:", err);
    } finally {
      setIsBackgroundRefreshing(false);
    }
  }, [refetch, refetchAvailableNeighborhoods, isCoreContributor, isBackgroundRefreshing]);

  // Set up periodic background refresh
  useEffect(() => {
    // Refresh data in the background every 5 minutes
    const intervalId = setInterval(() => {
      backgroundRefresh();
    }, 5 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [backgroundRefresh]);

  return {
    isBackgroundRefreshing,
    backgroundRefresh
  };
};
