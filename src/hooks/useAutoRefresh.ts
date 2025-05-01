
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AutoRefresh');

/**
 * Custom hook to automatically refresh data when specific events occur
 * 
 * This hook listens for custom events dispatched after form submissions
 * and triggers a refetch of the specified query keys to update the UI.
 * 
 * @param queryKeys - Array of React Query keys to invalidate on event
 * @param eventNames - Array of event names to listen for
 * @param refreshDelay - Optional delay in ms before refetching (default: 100ms)
 */
export const useAutoRefresh = (
  queryKeys: string[],
  eventNames: string[],
  refreshDelay: number = 100 // Reduced delay for faster refreshes
) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Create a handler function for the events
    const handleRefresh = (event: Event) => {
      logger.debug(`Event "${event.type}" triggered refreshing ${queryKeys.length} queries`);
      
      // Add a small delay to ensure the database has time to update
      // But make it shorter than before for better user experience
      setTimeout(() => {
        // Invalidate each query key to trigger a refetch
        queryKeys.forEach(key => {
          logger.debug(`Invalidating query key: ${key}`);
          queryClient.invalidateQueries({ queryKey: [key] });
          
          // Force refetch to ensure data is fresh
          queryClient.refetchQueries({ queryKey: [key] });
        });
      }, refreshDelay);
    };

    // Add event listeners for each event name
    eventNames.forEach(eventName => {
      logger.debug(`Setting up listener for "${eventName}" event`);
      document.addEventListener(eventName, handleRefresh);
    });
    
    // Clean up event listeners when component unmounts
    return () => {
      eventNames.forEach(eventName => {
        logger.debug(`Removing listener for "${eventName}" event`);
        document.removeEventListener(eventName, handleRefresh);
      });
    };
  }, [queryKeys, eventNames, refreshDelay, queryClient]);
};
