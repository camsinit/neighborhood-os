
/**
 * Custom hook that manages automatic refreshing for data
 * 
 * This hook listens for specific events and triggers a refetch of the data
 * when those events occur. It's simplified to use only direct database changes.
 */
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { refreshEvents, EventType } from "@/utils/refreshEvents";
import { createLogger } from "@/utils/logger";

// Create a logger for this hook
const logger = createLogger('useAutoRefresh');

export function useAutoRefresh(queryKeys: string[], eventTypes: EventType[]) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    logger.debug('Setting up auto-refresh listeners', { queryKeys, eventTypes });
    
    // For each event type, add a listener that will invalidate the specified query keys
    const unsubscribers = eventTypes.map(eventType => 
      refreshEvents.on(eventType, () => {
        logger.debug(`Event triggered: ${eventType}, refreshing:`, queryKeys);
        
        // Invalidate all affected query keys
        queryKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      })
    );
    
    // Cleanup function to remove all event listeners when component unmounts
    return () => {
      logger.debug('Cleaning up auto-refresh listeners');
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [queryClient, queryKeys, eventTypes]);
}
