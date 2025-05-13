/**
 * useNotificationPolling.ts
 * 
 * A dedicated hook for actively polling notifications with configurable intervals
 * This ensures we can reliably refresh notification data regardless of event propagation
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for the polling mechanism
const logger = createLogger('useNotificationPolling');

interface PollingOptions {
  enabled?: boolean;
  interval?: number;
  queryKeys: string[];
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

/**
 * Hook that provides reliable polling for notification data
 * 
 * @param options - Configuration options for polling
 * @returns Object containing polling state and control functions
 */
export const useNotificationPolling = ({
  enabled = true,
  interval = 30000, // Default to 30 seconds
  queryKeys,
  onSuccess,
  onError
}: PollingOptions) => {
  // Get the query client for cache invalidation
  const queryClient = useQueryClient();
  
  // Track polling state
  const [isPolling, setIsPolling] = useState(enabled);
  const [lastPolled, setLastPolled] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Use refs to track the most recent callback functions
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  
  // Keep callback refs updated
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);
  
  // Function to perform the actual refresh
  const refresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setError(null);
    
    try {
      // Log the refresh attempt with all query keys being invalidated
      logger.debug(`Manually polling notifications for keys: [${queryKeys.join(', ')}]`);

      // Invalidate all specified query keys
      const refreshPromises = queryKeys.map(key => 
        queryClient.invalidateQueries({ queryKey: [key] })
      );
      
      // Wait for all invalidations to complete
      await Promise.all(refreshPromises);
      
      // Update last polled timestamp and log success
      setLastPolled(new Date());
      logger.info(`Successfully polled notifications for ${queryKeys.length} query keys`);
      
      // Call success callback if provided
      if (onSuccessRef.current) {
        onSuccessRef.current();
      }
    } catch (err) {
      // Handle and log errors
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error(`Error polling notifications:`, error);
      setError(error);
      
      // Call error callback if provided
      if (onErrorRef.current) {
        onErrorRef.current(error);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, queryKeys, queryClient]);
  
  // Set up interval polling when enabled
  useEffect(() => {
    // Skip if polling is disabled
    if (!isPolling || !enabled) return;
    
    logger.debug(`Setting up notification polling interval every ${interval}ms`);
    
    // Immediately poll once
    refresh();
    
    // Set up interval for regular polling
    const intervalId = setInterval(refresh, interval);
    
    // Clean up interval on unmount or when dependencies change
    return () => {
      logger.debug('Cleaning up notification polling interval');
      clearInterval(intervalId);
    };
  }, [refresh, isPolling, enabled, interval]);
  
  // Function to manually start polling
  const startPolling = useCallback(() => {
    logger.debug('Starting notification polling');
    setIsPolling(true);
  }, []);
  
  // Function to manually stop polling
  const stopPolling = useCallback(() => {
    logger.debug('Stopping notification polling');
    setIsPolling(false);
  }, []);
  
  // Return polling state and control functions
  return {
    isPolling,
    isRefreshing,
    lastPolled,
    error,
    refresh,
    startPolling,
    stopPolling
  };
};

export default useNotificationPolling;
