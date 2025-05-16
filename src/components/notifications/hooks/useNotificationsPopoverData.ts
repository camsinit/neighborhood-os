
/**
 * useNotificationsPopoverData.ts
 * 
 * Simplified hook to fetch notification data for the notifications popover.
 * Uses React Query's built-in polling capabilities for automatic refreshes.
 * 
 * Component Integration Guide:
 * 1. Import this hook in your notification popover component
 * 2. Call the hook with the showArchived parameter
 * 3. Destructure data, isLoading, and refetch from the result
 * 4. Use these values to render your component
 * 5. The hook handles data fetching, caching, and refresh events
 * 
 * Data Flow:
 * 1. Component mounts and hook fetches initial data
 * 2. Hook sets up polling for periodic refreshes
 * 3. Hook subscribes to relevant refresh events
 * 4. When events occur, data is automatically refetched
 * 5. Component receives updated data via React Query
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
 * 
 * This hook simplifies data fetching for the notifications popover by:
 * 1. Setting up React Query for data fetching and caching
 * 2. Configuring automatic polling for fresh data
 * 3. Subscribing to relevant events for immediate updates
 * 
 * @param showArchived - Whether to show archived notifications
 * @returns Query result with notification data, loading state, and refetch function
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
      'skills-updated',
      'skill-request-created', 
      'skill-session-confirmed',
      'skill-session-cancelled',
      'skill-session-rescheduled',
      'skill-completed'
    ];
    
    /**
     * Handler for refresh events
     * Immediately triggers a data refetch when relevant events occur
     */
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
