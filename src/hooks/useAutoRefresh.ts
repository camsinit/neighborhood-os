
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AutoRefresh');

/**
 * Custom hook to automatically refresh data when specific events occur
 * 
 * This hook listens for custom events dispatched after form submissions
 * and triggers a refetch of the specified query keys to update the UI.
 * 
 * FIXED: Now includes debouncing and tracking to prevent duplicate refreshes
 * 
 * @param queryKeys - Array of React Query keys to invalidate on event
 * @param eventNames - Array of event names to listen for
 * @param refreshDelay - Optional delay in ms before refetching (default: 200ms)
 */
export const useAutoRefresh = (
  queryKeys: string[],
  eventNames: string[],
  refreshDelay: number = 200 // Small debounce delay to prevent multiple refreshes
) => {
  const queryClient = useQueryClient();
  
  // Use ref to track recent refreshes and prevent duplicates
  const recentRefreshesRef = useRef<Record<string, number>>({});
  
  useEffect(() => {
    // Create a handler function for the events
    const handleRefresh = (event: Event) => {
      const eventType = event.type;
      const currentTime = Date.now();
      
      // Check if this event has been handled recently
      if (
        recentRefreshesRef.current[eventType] && 
        currentTime - recentRefreshesRef.current[eventType] < refreshDelay * 2
      ) {
        logger.debug(`Skipping duplicate refresh for ${eventType} - too soon after last refresh`);
        return;
      }
      
      // Update the timestamp for this event
      recentRefreshesRef.current[eventType] = currentTime;
      
      logger.debug(`Event "${eventType}" triggered refreshing ${queryKeys.length} queries`);
      
      // Add a small delay to ensure the database has time to update
      // But make it shorter than before for better user experience
      setTimeout(() => {
        // Invalidate each query key to trigger a refetch
        queryKeys.forEach(key => {
          logger.debug(`Invalidating and refetching query key: ${key}`);
          
          // Invalidate and refetch in a single operation to ensure fresh data
          queryClient.invalidateQueries({ queryKey: [key] });
          queryClient.refetchQueries({ queryKey: [key] });
        });
      }, refreshDelay);
    };

    // Add event listeners for each event name
    eventNames.forEach(eventName => {
      logger.debug(`Setting up listener for "${eventName}" event`);
      
      // Use the full window object to listen for events
      window.addEventListener(eventName, handleRefresh);
    });
    
    // Clean up event listeners when component unmounts
    return () => {
      eventNames.forEach(eventName => {
        logger.debug(`Removing listener for "${eventName}" event`);
        window.removeEventListener(eventName, handleRefresh);
      });
    };
  }, [queryKeys, eventNames, refreshDelay, queryClient]);
};
