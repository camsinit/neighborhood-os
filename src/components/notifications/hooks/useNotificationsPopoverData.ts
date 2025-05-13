
/**
 * useNotificationsPopoverData.ts
 * 
 * Custom hook to fetch notification data for the notifications popover
 * Enhanced with automatic refresh capabilities and better error handling
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/hooks/notifications";
import { useEffect, useCallback, useState } from "react";
import { createLogger } from "@/utils/logger";
import { refreshEvents } from "@/utils/refreshEvents";

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
  
  // Leverage our main notifications hook with automatic polling enabled
  const notificationsQuery = useNotifications(showArchived);
  
  // Create a refresh function that invalidates the cache and refetches
  const refreshNotifications = useCallback(() => {
    // Log the refresh attempt
    logger.debug("Manually refreshing notifications");
    
    try {
      // Invalidate the notifications query cache
      queryClient.invalidateQueries({
        queryKey: ["notifications"]
      });
      
      // Force a refetch
      notificationsQuery.refetch()
        .then(() => {
          // Update last refreshed timestamp
          setLastRefreshed(new Date());
          logger.debug("Notifications refreshed successfully");
        })
        .catch(error => {
          logger.error("Error refreshing notifications:", error);
        });
    } catch (error) {
      logger.error("Failed to refresh notifications:", error);
    }
  }, [queryClient, notificationsQuery]);
  
  // Set up automatic polling for notifications
  useEffect(() => {
    // Skip if no refresh interval is specified
    if (!refreshInterval) return;
    
    logger.debug(`Setting up automatic refresh every ${refreshInterval}ms`);
    
    // Create an interval to refresh notifications
    const intervalId = setInterval(() => {
      logger.trace("Auto-refresh triggered");
      refreshNotifications();
    }, refreshInterval);
    
    // Clean up on unmount
    return () => {
      logger.debug("Cleaning up notification refresh interval");
      clearInterval(intervalId);
    };
  }, [refreshInterval, refreshNotifications]);
  
  // Add listeners for specific events that should trigger a notification refresh
  useEffect(() => {
    // Create event handlers to refresh notifications when specific events occur
    const handleRefreshEvent = () => {
      logger.debug("Refresh event detected, updating notifications");
      refreshNotifications();
    };
    
    // Listen for specific events that should trigger a refresh
    window.addEventListener('event-rsvp-updated', handleRefreshEvent);
    window.addEventListener('skills-updated', handleRefreshEvent);
    window.addEventListener('notification-created', handleRefreshEvent);
    
    // Set up subscription with refreshEvents utility
    const unsubscribeFromNotifications = refreshEvents.on('notification-created', handleRefreshEvent);
    
    // Debug message to confirm listeners are attached
    logger.debug("Event listeners attached for notification refresh");
    
    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('event-rsvp-updated', handleRefreshEvent);
      window.removeEventListener('skills-updated', handleRefreshEvent);
      window.removeEventListener('notification-created', handleRefreshEvent);
      
      // Unsubscribe from the refreshEvents utility
      if (unsubscribeFromNotifications) unsubscribeFromNotifications();
      
      logger.debug("Event listeners removed for notification refresh");
    };
  }, [refreshNotifications]);
  
  // Return the query result along with the refresh function and last refreshed timestamp
  return {
    ...notificationsQuery,
    refreshNotifications,
    lastRefreshed
  };
};
