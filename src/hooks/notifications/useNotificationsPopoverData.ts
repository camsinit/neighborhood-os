
/**
 * useNotificationsPopoverData.ts
 * 
 * Enhanced custom hook to fetch notification data for the notifications popover
 * Now with reliable event handling AND polling for maximum reliability
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/hooks/notifications";
import { useEffect, useCallback, useState } from "react";
import { createLogger } from "@/utils/logger";
import { refreshEvents } from "@/utils/refreshEvents";
import { useNotificationPolling } from "./useNotificationPolling";
import { useEventNotifications } from "./useEventNotifications";
import { toast } from "@/components/ui/use-toast";

// Create a dedicated logger for this hook
const logger = createLogger('useNotificationsPopoverData');

/**
 * Custom hook that provides notification data for the popover
 * Now with automatic refresh functionality
 * 
 * @param showArchived - Whether to show archived notifications
 * @param refreshInterval - Optional refresh interval in milliseconds (default: 30s)
 * @returns Query result with notification data and a refresh function
 */
export const useNotificationsPopoverData = (
  showArchived: boolean, 
  refreshInterval: number = 30000 // Default to 30 seconds
) => {
  // Get the query client for manual refreshes
  const queryClient = useQueryClient();
  
  // Track when the last refresh happened 
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  // Setup reliable notification handling through our specialized hook
  const { refreshNotifications: refreshEventNotifications } = useEventNotifications();
  
  // Track consecutive error count to prevent infinite loops
  const [consecutiveErrorCount, setConsecutiveErrorCount] = useState(0);
  const MAX_CONSECUTIVE_ERRORS = 3;
  
  // Track if the component is in an error state
  const [hasError, setHasError] = useState(false);
  
  // Leverage our main notifications hook with error handling
  const notificationsQuery = useNotifications(showArchived, {
    // Add onError handler to prevent infinite retries
    meta: {
      onError: (error: any) => {
        logger.error('Error in notifications query:', error);
        setConsecutiveErrorCount(prev => prev + 1);
        setHasError(true);
        
        // Show toast after threshold is reached
        if (consecutiveErrorCount >= MAX_CONSECUTIVE_ERRORS - 1) {
          toast({
            title: "Notification load failed",
            description: "There was a problem loading your notifications",
            variant: "destructive"
          });
        }
      }
    },
    // Only retry a limited number of times
    retry: (failureCount, error) => {
      // Stop retrying after a few attempts
      return failureCount < 2;
    }
  });
  
  // Use our polling hook with proper error tracking and circuit breaker
  const polling = useNotificationPolling({
    // Disable polling if we've hit the error threshold
    enabled: consecutiveErrorCount < MAX_CONSECUTIVE_ERRORS && !hasError,
    interval: refreshInterval,
    queryKeys: ["notifications"],
    onSuccess: () => {
      // Reset error count on success
      if (consecutiveErrorCount > 0) {
        setConsecutiveErrorCount(0);
        setHasError(false);
      }
      setLastRefreshed(new Date());
      logger.debug("Background polling refreshed notifications");
    },
    onError: (error) => {
      // Increment error count
      setConsecutiveErrorCount(prev => prev + 1);
      
      // Log the error
      logger.error("Polling error:", error);
      
      if (consecutiveErrorCount >= MAX_CONSECUTIVE_ERRORS - 1) {
        // Set error state to prevent further polling
        setHasError(true);
        
        // Notify the user
        toast({
          title: "Notification sync issue",
          description: "We're having trouble loading your notifications. Please try again later.",
          variant: "destructive"
        });
      }
    }
  });
  
  // Create a refresh function that invalidates the cache and refetches with error handling
  const refreshNotifications = useCallback(() => {
    // Check if we're in an error state
    if (hasError) {
      // Reset error state to allow fresh attempt
      setHasError(false);
      setConsecutiveErrorCount(0);
      logger.info("Resetting error state for fresh notification attempt");
    }
    
    // Only attempt refresh if we haven't hit the error threshold
    if (consecutiveErrorCount >= MAX_CONSECUTIVE_ERRORS) {
      logger.warn("Skipping manual refresh due to consecutive errors");
      return;
    }
    
    // Log the refresh attempt
    logger.info("Manually refreshing notifications");
    
    try {
      // Invalidate the notifications query cache
      queryClient.invalidateQueries({
        queryKey: ["notifications"]
      });
      
      // Force a refetch
      notificationsQuery.refetch()
        .then(() => {
          // Reset error count on success
          setConsecutiveErrorCount(0);
          setHasError(false);
          
          // Update last refreshed timestamp
          setLastRefreshed(new Date());
          logger.debug("Notifications refreshed successfully");
        })
        .catch(error => {
          // Increment error count
          setConsecutiveErrorCount(prev => prev + 1);
          
          logger.error("Error refreshing notifications:", error);
          
          // If we've hit the threshold, show a toast to the user
          if (consecutiveErrorCount >= MAX_CONSECUTIVE_ERRORS - 1) {
            setHasError(true);
            toast({
              title: "Notification refresh failed",
              description: "We couldn't load your notifications. Please try again later.",
              variant: "destructive"
            });
          }
        });
    } catch (error) {
      logger.error("Failed to refresh notifications:", error);
      setConsecutiveErrorCount(prev => prev + 1);
    }
  }, [queryClient, notificationsQuery, consecutiveErrorCount, hasError]);
  
  // Subscribe to refresh events from the refreshEvents utility
  useEffect(() => {
    logger.debug("Setting up refreshEvents subscription");
    
    // Set up subscription with refreshEvents utility
    const unsubscribeFromNotifications = refreshEvents.on('notification-created', () => {
      logger.info("Received notification-created event from refreshEvents");
      
      // Only attempt refresh if we haven't hit the error threshold
      if (consecutiveErrorCount < MAX_CONSECUTIVE_ERRORS && !hasError) {
        refreshNotifications();
      }
    });
    
    // Log diagnostics on page load
    logger.info("Notification listeners initialized at", new Date().toISOString());
    
    // Clean up subscription on unmount
    return () => {
      if (unsubscribeFromNotifications) unsubscribeFromNotifications();
      logger.debug("Removed refreshEvents subscription");
    };
  }, [refreshNotifications, consecutiveErrorCount, hasError]);
  
  // Return everything needed for notification handling
  return {
    ...notificationsQuery,
    refreshNotifications,
    lastRefreshed,
    hasError,
    errorCount: consecutiveErrorCount,
    pollingStatus: {
      isPolling: polling.isPolling && consecutiveErrorCount < MAX_CONSECUTIVE_ERRORS && !hasError,
      lastPolled: polling.lastPolled
    }
  };
};

export default useNotificationsPopoverData;
