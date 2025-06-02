
/**
 * Hook for handling neighborhood loading status and errors
 * 
 * This hook manages the loading and error states for neighborhood data,
 * including exponential backoff for retries and performance monitoring.
 */
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';

const logger = createLogger('NeighborhoodStatus');

/**
 * Custom hook for managing neighborhood loading status
 * 
 * @returns Object containing status-related state and functions
 */
export function useNeighborhoodStatus() {
  // State variables for loading status
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // State for retry mechanism with exponential backoff
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  
  // State to track fetch duration for performance monitoring
  const [fetchStartTime, setFetchStartTime] = useState<number | null>(null);

  // Create a memoized refresh function that can be called from outside
  const refreshNeighborhoodData = useCallback(() => {
    logger.debug("Manual refresh triggered");
    // Reset retry count on manual refresh
    setRetryCount(0);
    setFetchAttempts(prev => prev + 1);
  }, []);

  // Function to start a fetch operation and track its stats
  const startFetch = useCallback(() => {
    const startTime = Date.now();
    setFetchStartTime(startTime);
    
    logger.debug(`Fetch attempt ${fetchAttempts} starting`);
    
    // Reset states at the start of each fetch
    setError(null);
    setIsLoading(true);
    
    return startTime;
  }, [fetchAttempts]);

  // Function to handle successful fetch completion
  const completeFetch = useCallback((startTime: number) => {
    setIsLoading(false);
    
    // Calculate and log fetch duration for performance monitoring
    if (startTime) {
      const duration = Date.now() - startTime;
      logger.debug(`Fetch completed successfully (duration: ${duration}ms)`);
    }
  }, []);

  // Function to handle fetch errors
  const handleFetchError = useCallback((err: any, startTime?: number) => {
    // Handle unexpected errors
    logger.error("Error fetching neighborhood:", {
      error: err,
      errorMessage: err instanceof Error ? err.message : String(err),
      fetchAttempt: fetchAttempts
    });
    
    // Set error for UI to display
    setError(err instanceof Error ? err : new Error('Failed to fetch neighborhood'));
    
    // Always mark loading as complete
    setIsLoading(false);
    
    // Calculate fetch duration for performance logging
    if (startTime) {
      const duration = Date.now() - startTime;
      logger.debug(`Fetch failed with error (duration: ${duration}ms)`);
    }

    // Increment retry count for backoff calculation
    setRetryCount(prev => prev + 1);
  }, [fetchAttempts]);

  // Effect for auto-retrying with exponential backoff
  useEffect(() => {
    // Skip if there's no error
    if (!error) {
      return;
    }
    
    // Only retry up to 3 times
    if (retryCount >= 3) {
      logger.warn("Maximum retry attempts reached, stopping retries");
      toast.error("Failed to load neighborhood data after multiple attempts", {
        description: "Please try refreshing the page"
      });
      return;
    }
    
    // Implement exponential backoff: 2^retryCount * 1000ms (1s, 2s, 4s)
    const backoffTime = Math.min(2 ** retryCount * 1000, 10000); // Cap at 10 seconds
    logger.info(`Retrying after ${backoffTime}ms (attempt ${retryCount + 1})`);
    
    const retryTimer = setTimeout(() => {
      // Trigger another fetch attempt
      setFetchAttempts(prev => prev + 1);
    }, backoffTime);
    
    return () => {
      clearTimeout(retryTimer);
    };
  }, [error, retryCount]);

  return {
    isLoading,
    setIsLoading,
    error,
    setError,
    fetchAttempts,
    refreshNeighborhoodData,
    startFetch,
    completeFetch,
    handleFetchError
  };
}
