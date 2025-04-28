
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook to automatically refresh data when specific events occur
 * 
 * This hook listens for custom events dispatched after form submissions
 * and triggers a refetch of the specified query keys to update the UI.
 * 
 * @param queryKeys - Array of React Query keys to invalidate on event
 * @param eventNames - Array of event names to listen for
 * @param refreshDelay - Optional delay in ms before refetching (default: 500ms)
 */
export const useAutoRefresh = (
  queryKeys: string[],
  eventNames: string[],
  refreshDelay: number = 500
) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Create a handler function for the events
    const handleRefresh = (event: Event) => {
      console.log(`Event "${event.type}" triggered, refreshing queries: ${queryKeys.join(', ')}`);
      
      // Add a small delay to ensure the database has time to update
      setTimeout(() => {
        // Invalidate each query key to trigger a refetch
        queryKeys.forEach(key => {
          console.log(`Invalidating query: ${key}`);
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }, refreshDelay);
    };

    // Add event listeners for each event name
    eventNames.forEach(eventName => {
      console.log(`Setting up listener for "${eventName}" event`);
      document.addEventListener(eventName, handleRefresh);
    });
    
    // Clean up event listeners when component unmounts
    return () => {
      eventNames.forEach(eventName => {
        console.log(`Removing listener for "${eventName}" event`);
        document.removeEventListener(eventName, handleRefresh);
      });
    };
  }, [queryKeys, eventNames, refreshDelay, queryClient]);
};
