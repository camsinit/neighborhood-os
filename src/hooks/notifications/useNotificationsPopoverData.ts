
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
  
  // Leverage our main notifications hook
  const notificationsQuery = useNotifications(showArchived);
  
  // Use our new polling hook for reliable background refreshing
  const polling = useNotificationPolling({
    enabled: true,
    interval: refreshInterval,
    queryKeys: ["notifications"],
    onSuccess: () => {
      setLastRefreshed(new Date());
      logger.debug("Background polling refreshed notifications");
    }
  });
  
  // Create a refresh function that invalidates the cache and refetches
  const refreshNotifications = useCallback(() => {
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
  
  // Subscribe to refresh events from the refreshEvents utility
  useEffect(() => {
    logger.debug("Setting up refreshEvents subscription");
    
    // Set up subscription with refreshEvents utility
    const unsubscribeFromNotifications = refreshEvents.on('notification-created', () => {
      logger.info("Received notification-created event from refreshEvents");
      refreshNotifications();
    });
    
    // Log diagnostics on page load
    logger.info("Notification listeners initialized at", new Date().toISOString());
    
    // Clean up subscription on unmount
    return () => {
      if (unsubscribeFromNotifications) unsubscribeFromNotifications();
      logger.debug("Removed refreshEvents subscription");
    };
  }, [refreshNotifications]);
  
  // Return everything needed for notification handling
  return {
    ...notificationsQuery,
    refreshNotifications,
    lastRefreshed,
    pollingStatus: {
      isPolling: polling.isPolling,
      lastPolled: polling.lastPolled
    }
  };
};

export default useNotificationsPopoverData;
