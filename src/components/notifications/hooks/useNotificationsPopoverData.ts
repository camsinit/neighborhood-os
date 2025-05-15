
/**
 * useNotificationsPopoverData.ts
 * 
 * Simplified hook to fetch notification data for the notifications popover
 * Uses React Query's built-in polling capabilities for automatic refreshes
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BaseNotification } from "@/hooks/notifications/types";
import { createLogger } from "@/utils/logger";
import { refreshEvents, EventActionType } from "@/utils/refreshEvents";
import { useEffect } from "react";
import { fetchDirectNotifications } from "@/hooks/notifications/fetchDirectNotifications";

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
    // Create a handler for events that should trigger a refresh
    const handleRefreshEvent = () => {
      logger.debug("Refresh event detected, updating notifications");
      query.refetch();
    };
    
    // Define the refresh event types
    const refreshEventTypes: EventActionType[] = [
      'event-rsvp-updated',
      'skills-updated',
      'notification-created'
    ];
    
    // Listen for specific events that should trigger a refresh
    refreshEventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleRefreshEvent);
    });
    
    // Use the correctly typed subscription method
    const unsubscribe = refreshEvents.on('notification-created', handleRefreshEvent);
    
    // Clean up event listeners on unmount
    return () => {
      refreshEventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleRefreshEvent);
      });
      
      // Unsubscribe from the refreshEvents utility
      if (unsubscribe) unsubscribe();
    };
  }, [query]);
  
  // Return the simplified query result
  return query;
};
