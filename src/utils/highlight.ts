
/**
 * This utility creates consistent highlight listener functions
 * for finding and highlighting items in various modules
 */
import { createLogger } from '@/utils/logger';

const logger = createLogger('highlight');

/**
 * Creates a highlight event handler for a specific module type
 * This helps standardize how we highlight items across different modules
 * 
 * @param moduleType - Type of module ('skills', 'events', 'safety', 'goods')
 * @returns Event handler function
 */
export const createHighlightListener = (moduleType: string) => {
  return (event: Event) => {
    // Check if this is a CustomEvent with detail
    if (!(event instanceof CustomEvent) || !event.detail) {
      logger.debug(`Not a valid CustomEvent for ${moduleType}`);
      return;
    }
    
    const { id, type } = event.detail;
    
    // Check if this event is for our module type
    if (type !== moduleType) {
      logger.trace(`Event type ${type} doesn't match our module ${moduleType}`);
      return;
    }
    
    logger.debug(`Highlighting ${moduleType} item with ID: ${id}`);
    
    // Find the target element using a data attribute
    const selector = `[data-${moduleType}-id="${id}"]`;
    const target = document.querySelector(selector);
    
    if (target) {
      // Scroll to element
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add and remove highlight class for animation
      target.classList.add('highlight-pulse');
      setTimeout(() => {
        target.classList.remove('highlight-pulse');
      }, 2000);
      
      logger.debug(`Successfully highlighted ${moduleType} item`);
    } else {
      logger.debug(`Could not find ${moduleType} item with ID: ${id}`);
    }
  };
};

export default createHighlightListener;
