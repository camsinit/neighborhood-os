
/**
 * Highlight utilities
 * 
 * This module provides functions for highlighting items in the UI
 * and listening for highlight events.
 */
import { createLogger } from '@/utils/logger';

// Create a logger for this module
const logger = createLogger('highlight');

// Valid item types that can be highlighted
export type HighlightableItemType = 
  | 'event' 
  | 'safety' 
  | 'skills' 
  | 'goods' 
  | 'neighbors';

// Structure for highlight detail information
export interface HighlightItemDetail {
  type: HighlightableItemType;
  id: string;
}

// Event name for publishing/listening to highlight events
const HIGHLIGHT_EVENT_NAME = 'item-highlight';

/**
 * Highlight an item in the UI
 * 
 * This function dispatches a custom event that components can listen for
 * to highlight specific items in the UI
 * 
 * @param item - Either a HighlightItemDetail object or the type string (with id as second param)
 * @param id - Optional ID parameter when the first param is a string type
 */
export function highlightItem(item: HighlightItemDetail | HighlightableItemType, id?: string): void {
  try {
    // Handle both calling patterns:
    // highlightItem({type: 'event', id: '123'})
    // highlightItem('event', '123')
    let highlightDetail: HighlightItemDetail;
    
    if (typeof item === 'string' && id) {
      // String + ID version
      highlightDetail = { type: item, id };
    } else if (typeof item === 'object') {
      // Object version
      highlightDetail = item as HighlightItemDetail;
    } else {
      logger.error('Invalid parameters passed to highlightItem');
      return;
    }
    
    logger.debug(`Highlighting ${highlightDetail.type} with ID: ${highlightDetail.id}`);
    
    // Create and dispatch the custom event
    const event = new CustomEvent(HIGHLIGHT_EVENT_NAME, {
      detail: highlightDetail,
      bubbles: true,
    });
    
    window.dispatchEvent(event);
  } catch (error) {
    logger.error('Error highlighting item:', error);
  }
}

/**
 * Create a listener for highlight events
 * 
 * @param callback Function to call when an item is highlighted
 * @returns Cleanup function to remove the listener
 */
export function createHighlightListener(
  callback: (detail: HighlightItemDetail) => void
): () => void {
  const handler = (event: CustomEvent<HighlightItemDetail>) => {
    callback(event.detail);
  };
  
  window.addEventListener(HIGHLIGHT_EVENT_NAME, handler as EventListener);
  
  // Return a cleanup function
  return () => {
    window.removeEventListener(HIGHLIGHT_EVENT_NAME, handler as EventListener);
  };
}

/**
 * Navigate to an item and highlight it
 * 
 * @param type Item type
 * @param id Item ID
 * @param navigate React Router navigate function
 */
export function navigateAndHighlight(
  type: HighlightableItemType,
  id: string,
  navigate: (path: string) => void
): void {
  // Define routing based on type
  const routes: Record<HighlightableItemType, string> = {
    event: '/calendar',
    safety: '/safety',
    skills: '/skills',
    goods: '/goods',
    neighbors: '/neighbors'
  };
  
  // Navigate to the appropriate route
  navigate(routes[type]);
  
  // Highlight the item after a short delay to ensure component is mounted
  setTimeout(() => {
    highlightItem(type, id);
  }, 100);
}

export default {
  highlightItem,
  createHighlightListener,
  navigateAndHighlight
};
