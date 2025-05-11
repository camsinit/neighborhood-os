
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { refreshEvents } from '@/utils/refreshEvents';
import { createLogger } from '@/utils/logger';

// Create a dedicated logger for this hook
const logger = createLogger('useAutoRefresh');

/**
 * Custom hook to automatically refresh queries when specified events occur
 * Allows components to stay in sync with data changes across the app
 * 
 * @param queryKeys - Array of query keys to invalidate when events occur
 * @param events - Array of event names to listen for
 * @param debounceMs - Optional debounce time in milliseconds
 */
export const useAutoRefresh = (
  queryKeys: string[],
  events: string[],
  debounceMs = 100 // Reduced from 300ms to 100ms for quicker updates
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // We'll use this to track our timeout ID for debouncing
    let debounceTimeout: NodeJS.Timeout | null = null;
    
    // Store unsubscribe functions to clean up later
    const unsubscribers: (() => void)[] = [];
    
    // Log which events we're listening to for debugging
    logger.info(`Setting up listeners for events:`, events, 
      `to refresh queries:`, queryKeys);
    
    // Create a debounced refresh function to prevent excessive query invalidation
    const debouncedRefresh = () => {
      // Clear any pending timeout
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      
      // Set a new timeout
      debounceTimeout = setTimeout(() => {
        logger.info(`Refreshing queries:`, queryKeys);
        
        // Add trace logs for each query invalidation
        queryKeys.forEach(key => {
          logger.trace(`Invalidating query key: [${key}]`);
          queryClient.invalidateQueries({ queryKey: [key] });
          logger.trace(`Query invalidation complete for: [${key}]`);
        });
      }, debounceMs);
    };
    
    // Subscribe to each event
    events.forEach(event => {
      logger.trace(`Setting up listener for event: ${event}`);
      
      const unsubscribe = refreshEvents.on(event, () => {
        logger.debug(`Event triggered: ${event}, refreshing queries:`, queryKeys);
        logger.trace(`Event payload received for: ${event}`);
        debouncedRefresh();
      });
      
      unsubscribers.push(unsubscribe);
      logger.trace(`Listener for ${event} successfully registered`);
    });
    
    // Clean up event listeners and any pending timeout when component unmounts
    return () => {
      logger.info(`Cleaning up listeners for:`, events);
      unsubscribers.forEach((unsubscribe, index) => {
        logger.trace(`Unsubscribing from event: ${events[index] || 'unknown'}`);
        unsubscribe();
      });
      if (debounceTimeout) {
        logger.trace(`Clearing debounce timeout`);
        clearTimeout(debounceTimeout);
      }
    };
  }, [queryClient, JSON.stringify(queryKeys), JSON.stringify(events), debounceMs]);
};
