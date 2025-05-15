
/**
 * Highlight Module
 * 
 * This module provides utilities for highlighting UI elements and navigating to them.
 * It enables features like highlighting new content, notifying users of changes,
 * and handling navigation to specific items.
 */
import { createLogger } from '@/utils/logger';

// Create a logger for this module
const logger = createLogger('highlight');

/**
 * Types of items that can be highlighted
 */
export type HighlightableItemType = 'event' | 'safety' | 'care' | 'goods' | 'skills' | 'notification';

/**
 * Structure for highlight item details
 */
export interface HighlightItemDetail {
  id: string;
  type: HighlightableItemType;
  elementId?: string;
  route?: string;
}

// Global storage for the active highlight
let activeHighlight: HighlightItemDetail | null = null;

/**
 * Highlight a specific item in the UI
 * 
 * @param detail Details of the item to highlight
 * @returns Boolean indicating success
 */
export const highlightItem = (detail: HighlightItemDetail): boolean => {
  try {
    logger.debug('Highlighting item:', detail);
    
    // Store the active highlight
    activeHighlight = detail;
    
    // Find the element to highlight
    const elementId = detail.elementId || `item-${detail.type}-${detail.id}`;
    const element = document.getElementById(elementId);
    
    if (!element) {
      logger.debug(`Element with id ${elementId} not found, will try again when available`);
      return false;
    }
    
    // Add highlight class and scroll into view
    element.classList.add('highlight-pulse');
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Remove highlight after animation
    setTimeout(() => {
      element.classList.remove('highlight-pulse');
      activeHighlight = null;
    }, 3000);
    
    return true;
  } catch (error) {
    logger.error('Error highlighting item:', error);
    return false;
  }
};

/**
 * Create a highlight event listener
 * 
 * @param type Type of items to listen for
 * @param callback Function to call when item should be highlighted
 */
export const createHighlightListener = (
  type: HighlightableItemType,
  callback: (id: string) => void
): () => void => {
  logger.debug('Creating highlight listener for:', type);
  
  // Create event handler
  const handleHighlight = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail?.type === type && customEvent.detail?.id) {
      callback(customEvent.detail.id);
    }
  };
  
  // Add event listener
  window.addEventListener('highlight-item', handleHighlight);
  
  // Return function to remove listener
  return () => {
    window.removeEventListener('highlight-item', handleHighlight);
  };
};

/**
 * Navigate to a specific item and highlight it
 * 
 * @param detail Details of the item to navigate to
 */
export const navigateAndHighlight = (detail: HighlightItemDetail): void => {
  logger.debug('Navigating to and highlighting:', detail);
  
  // Save highlight for after navigation
  activeHighlight = detail;
  
  // If route is provided, navigate to it
  if (detail.route) {
    // Check if we're already on the correct route
    const currentPath = window.location.pathname;
    if (!currentPath.includes(detail.route)) {
      // Navigate to the route
      window.location.href = detail.route;
      return;
    }
  }
  
  // If we're already on the correct route, highlight immediately
  highlightItem(detail);
};

// Export interface for backward compatibility
export default {
  highlightItem,
  createHighlightListener,
  navigateAndHighlight
};
