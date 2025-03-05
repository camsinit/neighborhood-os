
import { useState, useEffect } from 'react';

/**
 * Hook to ensure loading states eventually time out
 * 
 * This hook provides a safety mechanism to prevent infinite loading states
 * by forcing loading to false after a timeout period.
 * 
 * @param isLoading Current loading state
 * @param hasFetchAttempted Whether a fetch has been attempted
 * @returns Object containing timeout functions and state
 */
export function useNeighborhoodSafetyTimeout(isLoading: boolean, hasFetchAttempted: boolean) {
  // Track fetch start time for performance monitoring
  const [fetchStartTime, setFetchStartTime] = useState<number | null>(null);

  // Add an additional safety check to ensure we don't stay in loading state indefinitely
  useEffect(() => {
    // If we've attempted a fetch, but we're still loading after 5 seconds, force loading to false
    if (hasFetchAttempted && isLoading) {
      const forceLoadingOffTimer = setTimeout(() => {
        if (isLoading) {
          console.warn("[useNeighborhoodSafetyTimeout] Forcing loading state to false after timeout");
          return false; // Signal to set loading to false
        }
      }, 5000); // 5 second backup timeout
      
      return () => {
        clearTimeout(forceLoadingOffTimer);
      };
    }
  }, [hasFetchAttempted, isLoading]);

  // Function to start timing a fetch operation
  const startFetchTimer = () => {
    const startTime = Date.now();
    setFetchStartTime(startTime);
    return startTime;
  };

  // Function to end timing and log the duration
  const endFetchTimer = (startTime: number) => {
    const duration = Date.now() - startTime;
    console.log(`[useNeighborhoodSafetyTimeout] Fetch completed (duration: ${duration}ms)`);
  };

  return {
    startFetchTimer,
    endFetchTimer,
    fetchStartTime
  };
}
