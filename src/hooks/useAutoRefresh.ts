
/**
 * Hook to automatically refresh query data when specific events occur
 * This is a centralized way to handle data refreshing across the app
 */
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createLogger } from '@/utils/logger';

// Create a dedicated logger for this hook
const logger = createLogger('useAutoRefresh');

/**
 * Hook that listens for specified events and invalidates the related queries
 * 
 * @param queryKeys - Array of query keys to invalidate when events occur
 * @param eventTypes - Array of event types to listen for
 */
export const useAutoRefresh = (
  queryKeys: string[], 
  eventTypes: string[]
) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    logger.debug(`Setting up auto-refresh for queries: ${queryKeys.join(', ')} on events: ${eventTypes.join(', ')}`);
    
    // Create event handlers for each event type
    const handlers: { [key: string]: EventListener } = {};
    
    eventTypes.forEach(eventType => {
      // Create a handler for this specific event type
      const handler = () => {
        logger.debug(`Received ${eventType} event, invalidating queries: ${queryKeys.join(', ')}`);
        
        // Invalidate all the specified queries
        queryKeys.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      };
      
      // Store the handler so we can remove it later
      handlers[eventType] = handler as EventListener;
      
      // Add event listener
      window.addEventListener(eventType, handler as EventListener);
      logger.trace(`Added listener for ${eventType}`);
    });
    
    // Clean up event listeners on unmount
    return () => {
      eventTypes.forEach(eventType => {
        if (handlers[eventType]) {
          window.removeEventListener(eventType, handlers[eventType]);
          logger.trace(`Removed listener for ${eventType}`);
        }
      });
      logger.debug('Cleaned up all auto-refresh event listeners');
    };
  }, [queryClient, ...queryKeys, ...eventTypes]);
};

// Export the hook as default
export default useAutoRefresh;
