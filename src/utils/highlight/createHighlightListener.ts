
/**
 * A utility for creating highlight event listeners
 * 
 * This simplified approach returns a function that can be called
 * when an item matching the specified criteria is highlighted
 */
import { HighlightItemDetail } from './types';
import { createLogger } from '@/utils/logger';

// Create a dedicated logger for this utility
const logger = createLogger('createHighlightListener');

// Event name for highlight events
const HIGHLIGHT_EVENT_NAME = 'item-highlight';

/**
 * Create a listener for highlight events
 * 
 * @param callback Function to call when an item is highlighted
 * @returns Function to remove the listener
 */
export function createHighlightListener(
  callback: (detail: HighlightItemDetail) => void
): () => void {
  logger.debug('Creating highlight event listener');
  
  // Create event handler function
  const handler = (event: CustomEvent<HighlightItemDetail>) => {
    logger.debug('Highlight event received:', event.detail);
    callback(event.detail);
  };
  
  // Add event listener to window
  window.addEventListener(
    HIGHLIGHT_EVENT_NAME, 
    handler as EventListener
  );
  
  // Return cleanup function
  return () => {
    logger.debug('Removing highlight event listener');
    window.removeEventListener(
      HIGHLIGHT_EVENT_NAME, 
      handler as EventListener
    );
  };
}

export default createHighlightListener;
