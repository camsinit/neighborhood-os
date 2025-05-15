
import { toast } from 'sonner';
import { routeMap, dataAttributeMap, readableTypeNames } from './constants';
import { HighlightableItemType } from './types';
import { createLogger } from '@/utils/logger';

// Create a dedicated logger for this utility
const logger = createLogger('highlightItem');

/**
 * Highlights an element by applying visual effects
 * 
 * @param element The DOM element to highlight
 * @param options Optional configurations for the highlight effect
 */
export function highlightElement(
  element: HTMLElement | null,
  options: {
    scrollIntoView?: boolean;
    showToast?: boolean;
    title?: string;
    message?: string;
  } = {}
) {
  if (!element) return;
  
  const {
    scrollIntoView = true,
    showToast = true,
    title = 'Item Found',
    message = 'The requested item has been found and highlighted'
  } = options;

  // Add highlight class
  element.classList.add('highlight-item');
  
  // Remove the class after animation completes
  setTimeout(() => {
    element.classList.remove('highlight-item');
  }, 2000);
  
  // Scroll into view if requested
  if (scrollIntoView) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
  
  // Show toast notification if requested
  if (showToast) {
    toast(title, {
      description: message
    });
  }
}

/**
 * Highlights a specific item in the DOM
 * 
 * @param itemType The type of item to highlight
 * @param itemId The ID of the item to highlight
 * @param showToast Whether to show a toast notification
 */
export const highlightItem = (
  itemType: HighlightableItemType,
  itemId: string,
  showToast: boolean = false
): void => {
  try {
    logger.debug(`Attempting to highlight ${itemType} with ID ${itemId}`);
    
    // Find element to highlight based on the data attribute
    const selector = `[data-${dataAttributeMap[itemType]}="${itemId}"]`;
    const element = document.querySelector(selector);
    
    if (!element) {
      logger.debug(`Element for ${itemType} with ID ${itemId} not found in DOM`);
      return;
    }
    
    // Get a readable name for the item type
    const readableName = readableTypeNames[itemType] || 'Item';
    
    // Highlight the element
    highlightElement(element as HTMLElement, {
      showToast,
      title: `${readableName} Found`,
      message: `The requested ${readableName.toLowerCase()} has been highlighted.`
    });
    
    logger.debug(`Successfully highlighted ${itemType} with ID ${itemId}`);
  } catch (error) {
    logger.error(`Error highlighting ${itemType} with ID ${itemId}:`, error);
  }
};
