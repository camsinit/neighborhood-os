
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { refreshEvents } from '@/utils/refreshEvents';

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
  debounceMs = 300
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // We'll use this to track our timeout ID for debouncing
    let debounceTimeout: NodeJS.Timeout | null = null;
    
    // Store unsubscribe functions to clean up later
    const unsubscribers: (() => void)[] = [];
    
    // Create a debounced refresh function to prevent excessive query invalidation
    const debouncedRefresh = () => {
      // Clear any pending timeout
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      
      // Set a new timeout
      debounceTimeout = setTimeout(() => {
        console.log('[useAutoRefresh] Refreshing queries:', queryKeys);
        
        // Invalidate all query keys that were provided
        queryKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }, debounceMs);
    };
    
    // Subscribe to each event
    events.forEach(event => {
      const unsubscribe = refreshEvents.on(event, debouncedRefresh);
      unsubscribers.push(unsubscribe);
      
      // Log which events we're listening to for debugging
      console.log(`[useAutoRefresh] Listening for '${event}' event to refresh:`, queryKeys);
    });
    
    // Clean up event listeners and any pending timeout when component unmounts
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [queryClient, JSON.stringify(queryKeys), JSON.stringify(events), debounceMs]);
};
