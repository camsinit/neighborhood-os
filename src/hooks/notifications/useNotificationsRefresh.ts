
/**
 * useNotificationsRefresh.ts
 * 
 * Hook for handling notification refresh events
 * 
 * Component Integration Guide:
 * 1. Import this hook in your notification components
 * 2. Pass in the refetch function from React Query
 * 3. The hook will automatically set up event listeners
 * 4. When relevant events occur, your data will refresh
 * 5. No additional code needed for standard refresh behavior
 * 
 * Event Subscription Flow:
 * 1. Component mounts and hook sets up listeners
 * 2. When database operations occur elsewhere, events are emitted
 * 3. This hook receives those events and triggers a refetch
 * 4. The component receives fresh data from React Query
 * 5. When component unmounts, all subscriptions are cleaned up
 */
import { useEffect } from "react";
import { createLogger } from "@/utils/logger";
import { refreshEvents, EventType } from "@/utils/refreshEvents";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { BaseNotification } from "@/hooks/notifications/types";

// Create a dedicated logger for this hook
const logger = createLogger('useNotificationsRefresh');

/**
 * Types for the hook parameters
 * 
 * @property {Function} refetch - The React Query refetch function 
 */
interface UseNotificationsRefreshParams {
  refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<BaseNotification[], Error>>;
}

/**
 * Hook that sets up refresh event listeners for notifications
 * 
 * This hook subscribes to relevant refresh events and triggers
 * a data refetch when those events occur. It handles debouncing
 * multiple rapid events to prevent excessive API calls.
 * 
 * @param param0 - The refetch function from a React Query hook
 */
export const useNotificationsRefresh = ({ refetch }: UseNotificationsRefreshParams): void => {
  // Set up listeners for events that should trigger a notification refresh
  useEffect(() => {
    logger.debug("Setting up notification refresh listeners");
    
    // Define all the events that should trigger a refresh
    // These are now all properly defined in the EventType
    const refreshEventTypes: EventType[] = [
      'notification-created',
      'notification-read',
      'notification-archived',
      'notifications-all-read',
      'event-rsvp-updated',
      'skills-updated',
      'safety-updated',
      'goods-updated'
    ];
    
    // Create a debounced handler to prevent too frequent refreshes
    let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
    
    /**
     * Debounced handler for refresh events
     * This prevents multiple rapid events from triggering
     * too many API calls in a short period
     */
    const handleRefreshEvent = () => {
      // Clear existing timeout if any
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      
      // Set new timeout to debounce multiple rapid events
      refreshTimeout = setTimeout(() => {
        logger.debug("Refresh event detected, updating notifications");
        refetch({ cancelRefetch: false });
      }, 300); // 300ms debounce
    };
    
    // Set up subscriptions for all relevant event types
    const unsubscribers = refreshEventTypes.map(eventType => 
      refreshEvents.on(eventType, handleRefreshEvent)
    );
    
    // Clean up event listeners and timeout on unmount
    return () => {
      logger.debug("Cleaning up notification refresh listeners");
      unsubscribers.forEach(unsubscribe => unsubscribe());
      
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [refetch]);
};
