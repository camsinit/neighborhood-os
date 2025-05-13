
/**
 * useNotificationsPopoverData.ts
 * 
 * Custom hook that provides notification data for the popover
 * Now with enhanced support for RSVP notifications
 */
import { useQuery } from "@tanstack/react-query";
import { fetchDirectNotifications } from "@/hooks/notifications/fetchDirectNotifications";
import { createLogger } from "@/utils/logger";
import { refreshEvents } from "@/utils/refreshEvents";
import { useEffect } from "react";

// Create a dedicated logger for this hook
const logger = createLogger('useNotificationsPopoverData');

/**
 * Custom hook that provides notification data for the popover
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
    refetchInterval: 15000, // 15 seconds - reduced from 30 for more responsive updates
    refetchIntervalInBackground: false,
    // Enable automatic refetching when window regains focus
    refetchOnWindowFocus: true,
    staleTime: 5000, // Consider data stale after 5 seconds to encourage refreshes
    // Add some retry logic
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Set up listeners for specific events that should trigger a notification refresh
  useEffect(() => {
    logger.debug("Setting up notification refresh listeners");
    
    // Create a handler for events that should trigger a refresh
    const handleRefreshEvent = () => {
      logger.debug("Refresh event detected, updating notifications");
      query.refetch();
    };
    
    // Set up additional listener specifically for RSVP updates
    const handleRsvpEvent = () => {
      logger.debug("RSVP event detected, updating notifications");
      // Force a refetch with a slight delay to allow database operations to complete
      setTimeout(() => query.refetch(), 500);
    };
    
    // Listen for specific events that should trigger a refresh
    window.addEventListener('event-rsvp-updated', handleRsvpEvent);
    window.addEventListener('skills-updated', handleRefreshEvent);
    window.addEventListener('notification-created', handleRefreshEvent);
    
    // Set up subscription with refreshEvents utility - catch all relevant types
    const unsubscribeNotif = refreshEvents.on('notifications', handleRefreshEvent);
    const unsubscribeRsvp = refreshEvents.on('event-rsvp', handleRsvpEvent);
    
    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('event-rsvp-updated', handleRsvpEvent);
      window.removeEventListener('skills-updated', handleRefreshEvent);
      window.removeEventListener('notification-created', handleRefreshEvent);
      
      // Unsubscribe from the refreshEvents utility
      if (unsubscribeNotif) unsubscribeNotif();
      if (unsubscribeRsvp) unsubscribeRsvp();
    };
  }, [query]);
  
  return query;
};
