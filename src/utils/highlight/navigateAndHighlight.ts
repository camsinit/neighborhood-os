
/**
 * Navigation utility for highlight feature
 * 
 * This file contains a utility function that combines navigation
 * and highlighting in one operation
 */
import { highlightItem } from './highlightItem';
import { HighlightableItemType } from './types';
import { routeMap } from './constants';
import { createLogger } from '@/utils/logger';

// Create a dedicated logger for this utility
const logger = createLogger('navigateAndHighlight');

/**
 * Navigate to a specific route and highlight an item
 * 
 * @param itemType The type of item to highlight
 * @param itemId The ID of the item to highlight
 * @param navigate The navigate function from react-router
 * @param showToast Whether to show a toast notification
 */
export const navigateAndHighlight = (
  itemType: HighlightableItemType,
  itemId: string,
  navigate: (path: string) => void,
  showToast: boolean = false
): void => {
  try {
    // Get the route for this item type
    const route = routeMap[itemType];
    
    if (!route) {
      logger.error(`No route defined for item type: ${itemType}`);
      return;
    }
    
    logger.debug(`Navigating to ${route} for ${itemType} item ${itemId}`);
    
    // Navigate to the correct route
    navigate(route);
    
    // After navigation, highlight the item with a slight delay
    // to allow the page to render
    setTimeout(() => {
      highlightItem(itemType, itemId, showToast);
    }, 300);
  } catch (error) {
    logger.error(`Error in navigateAndHighlight:`, error);
  }
};
