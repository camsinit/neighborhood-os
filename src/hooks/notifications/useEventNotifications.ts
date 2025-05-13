
/**
 * useEventNotifications.ts
 * 
 * A specialized hook for handling event notifications like RSVPs
 * This ensures that we properly refresh notification data when events like RSVPs occur
 */
import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createLogger } from "@/utils/logger";

// Set up logger for this hook
const logger = createLogger('useEventNotifications');

/**
 * Hook specifically for handling event-related notifications
 * It sets up listeners for RSVP events and forces refresh of notification data
 */
export const useEventNotifications = () => {
  // Get the query client for cache invalidation
  const queryClient = useQueryClient();
  
  // Define refresh function
  const refreshNotifications = useCallback(() => {
    logger.info("Refreshing notifications due to event activity");
    
    try {
      // Invalidate notifications query to trigger refetch
      queryClient.invalidateQueries({ 
        queryKey: ["notifications"]
      });
      
      logger.debug("Successfully invalidated notification queries");
    } catch (error) {
      logger.error("Error refreshing notifications:", error);
    }
  }, [queryClient]);
  
  // Set up event listeners specifically for event-related activities
  useEffect(() => {
    // Log when we're setting up the listeners
    logger.debug("Setting up event notification listeners");
    
    // Create the event handler function
    const handleEventActivity = (event: Event) => {
      // Log the specific event type that was received
      logger.info(`Detected event activity: ${event.type}`);
      refreshNotifications();
    };
    
    // Add listeners for all event-related activities
    window.addEventListener('event-rsvp-updated', handleEventActivity);
    window.addEventListener('event-submitted', handleEventActivity);
    window.addEventListener('event-deleted', handleEventActivity);
    window.addEventListener('notification-created', handleEventActivity);
    
    // Clean up listeners on unmount
    return () => {
      logger.debug("Removing event notification listeners");
      window.removeEventListener('event-rsvp-updated', handleEventActivity);
      window.removeEventListener('event-submitted', handleEventActivity);
      window.removeEventListener('event-deleted', handleEventActivity);
      window.removeEventListener('notification-created', handleEventActivity);
    };
  }, [refreshNotifications]);
  
  return { refreshNotifications };
};

export default useEventNotifications;
