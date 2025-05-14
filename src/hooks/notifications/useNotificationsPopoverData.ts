
/**
 * useNotificationsPopoverData.ts
 * 
 * Enhanced hook to fetch notification data for the notifications popover
 * Now with improved refresh mechanisms and debugging
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BaseNotification } from "@/hooks/notifications/types";
import { createLogger } from "@/utils/logger";
import { refreshEvents } from "@/utils/refreshEvents";
import { useEffect, useState } from "react";
import { fetchDirectNotifications } from "@/hooks/notifications/fetchDirectNotifications";

// Create a dedicated logger for this hook
const logger = createLogger('useNotificationsPopoverData');

/**
 * Custom hook that provides notification data for the popover
 * Enhanced with better refresh mechanisms and debugging
 * 
 * @param showArchived - Whether to show archived notifications
 * @returns Query result with notification data
 */
export const useNotificationsPopoverData = (showArchived: boolean) => {
  // Track refresh triggers for debugging
  const [refreshTriggers, setRefreshTriggers] = useState<string[]>([]);

  // Use React Query with more aggressive refresh settings
  const query = useQuery({
    queryKey: ["notifications", showArchived, refreshTriggers], // Include refreshTriggers to force refetch
    queryFn: () => fetchDirectNotifications(showArchived),
    // Set up automatic polling with shorter interval for better responsiveness
    refetchInterval: 15000, // 15 seconds (reduced from 30)
    refetchIntervalInBackground: false,
    // Enable automatic refetching when window regains focus
    refetchOnWindowFocus: true,
    // Add some retry logic
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Make stale faster for quicker refreshes
    staleTime: 10000, // 10 seconds
  });

  // Create a more robust refresh handler that logs the trigger source
  const createRefreshHandler = (source: string) => () => {
    logger.debug(`Refresh triggered by: ${source}`);
    setRefreshTriggers(prev => [...prev, `${source}-${Date.now()}`]);
    query.refetch();
  };

  // Set up listeners for specific events that should trigger a notification refresh
  useEffect(() => {
    logger.debug("Setting up notification refresh listeners");
    
    // Set up event listeners for each event type
    const events = [
      'event-rsvp-updated',
      'skills-updated',
      'notification-created',
      'event-submitted',
      'safety-updated',
      'goods-updated'
    ];
    
    // Create handlers for each event type
    const handlers = events.map(eventName => {
      const handler = createRefreshHandler(`event:${eventName}`);
      window.addEventListener(eventName, handler);
      return { eventName, handler };
    });
    
    // Set up subscription with refreshEvents utility
    const unsubscribe = refreshEvents.on('notification-created', createRefreshHandler('refreshEvents:notification-created'));
    
    // Clean up event listeners on unmount
    return () => {
      logger.debug("Cleaning up notification refresh listeners");
      handlers.forEach(({ eventName, handler }) => {
        window.removeEventListener(eventName, handler);
      });
      
      // Unsubscribe from the refreshEvents utility
      if (unsubscribe) unsubscribe();
    };
  }, [query]);
  
  // Return the query result
  return query;
};
