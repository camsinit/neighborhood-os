
/**
 * useNotificationsPopoverData.ts
 * 
 * Simplified hook to fetch notification data for the notifications popover
 * Uses React Query's built-in polling capabilities for automatic refreshes
 */
import { useQuery } from "@tanstack/react-query";
import { createLogger } from "@/utils/logger";
import { useEffect } from "react";
import { fetchDirectNotifications } from "@/hooks/notifications/fetchDirectNotifications";
import { refreshEvents, EventType } from "@/utils/refreshEvents";

// Create a dedicated logger for this hook
const logger = createLogger('useNotificationsPopoverData');

/**
 * Custom hook that provides notification data for the popover
 * Simplified to rely on React Query's built-in polling
 * 
 * @param showArchived - Whether to show archived notifications
 * @returns Query result with notification data
 */
export const useNotificationsPopoverData = (showArchived: boolean) => {
  // Use React Query with polling enabled
  const query = useQuery({
    queryKey: ["notifications", showArchived],
    queryFn: () => fetchDirectNotifications(showArchived),
    // Set up automatic polling
    refetchInterval: 30000, // 30 seconds
    refetchIntervalInBackground: false,
    // Enable automatic refetching when window regains focus
    refetchOnWindowFocus: true,
    // Add some retry logic
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Set up listeners for specific events that should trigger a notification refresh
  useEffect(() => {
    logger.debug("Setting up notification refresh listeners");
    
    // Define events that should trigger a refresh
    const refreshEventTypes: EventType[] = [
      'notification-created',
      'event-rsvp-updated',
      'skills-updated'
    ];
    
    // Create a handler for the refresh events
    const handleRefreshEvent = () => {
      logger.debug("Refresh event detected, updating notifications");
      query.refetch();
    };
    
    // Subscribe to all relevant events
    const unsubscribers = refreshEventTypes.map(eventType =>
      refreshEvents.on(eventType, handleRefreshEvent)
    );
    
    // Clean up subscriptions on unmount
    return () => {
      logger.debug("Cleaning up notification refresh listeners");
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [query]);
  
  // Return the query result
  return query;
};
