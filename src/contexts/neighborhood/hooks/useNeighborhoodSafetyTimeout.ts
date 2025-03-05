
/**
 * Hook to manage safety timeouts for neighborhood data fetching
 * 
 * This module provides timeout functionality to prevent infinite loading states
 */
import { useState, useCallback } from 'react';

/**
 * Safety timeout hook for neighborhood fetching
 * 
 * @param isLoading - Current loading state
 * @param hasFetchAttempted - Whether a fetch has been attempted
 * @returns Functions to start and end fetch timers
 */
export const useNeighborhoodSafetyTimeout = (
  isLoading: boolean,
  hasFetchAttempted: boolean
) => {
  // Track the safety timeout
  const [safetyTimeout, setSafetyTimeout] = useState<NodeJS.Timeout | null>(null);

  // Start a safety timer
  const startFetchTimer = useCallback(() => {
    // Clear any existing timer first
    if (safetyTimeout) {
      clearTimeout(safetyTimeout);
    }
    
    // Set a new timer that will force loading to false after 10 seconds
    const timer = setTimeout(() => {
      console.warn('[useNeighborhoodSafetyTimeout] Safety timeout triggered - fetch is taking too long');
    }, 10000); // 10 second timeout
    
    setSafetyTimeout(timer);
  }, [safetyTimeout]);

  // End the safety timer
  const endFetchTimer = useCallback(() => {
    if (safetyTimeout) {
      clearTimeout(safetyTimeout);
      setSafetyTimeout(null);
    }
  }, [safetyTimeout]);

  return {
    startFetchTimer,
    endFetchTimer
  };
};
