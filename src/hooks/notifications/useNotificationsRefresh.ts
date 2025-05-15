
/**
 * useNotificationsRefresh.ts
 * 
 * Hook for handling notification refresh events
 * Isolates the refresh event handling logic
 */
import { useEffect } from "react";
import { createLogger } from "@/utils/logger";
import { refreshEvents, EventType } from "@/utils/refreshEvents";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { BaseNotification } from "@/hooks/notifications/types";

// Create a dedicated logger for this hook
const logger = createLogger('useNotificationsRefresh');

// Types for the hook parameters
interface UseNotificationsRefreshParams {
  refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<BaseNotification[], Error>>;
}

/**
 * Hook that sets up refresh event listeners for notifications
 * 
 * @param param0 - The refetch function from a React Query hook
 */
export const useNotificationsRefresh = ({ refetch }: UseNotificationsRefreshParams): void => {
  // Set up listeners for events that should trigger a notification refresh
  useEffect(() => {
    logger.debug("Setting up notification refresh listeners");
    
    // Define all the events that should trigger a refresh
    const refreshEventTypes: EventType[] = [
      'notification-created',
      'event-rsvp-updated',
      'skills-updated',
      'safety-updated',
      'goods-updated',
      'skill-request-created', 
      'skill-session-confirmed',
      'skill-session-cancelled',
      'skill-session-rescheduled',
      'skill-completed'
    ];
    
    // Create a handler for the refresh events
    const handleRefreshEvent = () => {
      logger.debug("Refresh event detected, updating notifications");
      refetch();
    };
    
    // Set up subscriptions for all relevant event types
    const unsubscribers = refreshEventTypes.map(eventType => 
      refreshEvents.on(eventType, handleRefreshEvent)
    );
    
    // Clean up event listeners on unmount
    return () => {
      logger.debug("Cleaning up notification refresh listeners");
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [refetch]);
};
