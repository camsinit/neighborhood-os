
/**
 * Navigation utility that combines routing and element highlighting
 * 
 * This file contains a function to navigate to the right page and then
 * highlight the specified item after navigation is complete
 */
import { HighlightableItemType } from './types';
import { routeMap } from './constants';
import { highlightItem } from './highlightItem';

/**
 * Navigate to a specific page and highlight an item
 * 
 * @param type The type of item to navigate to and highlight
 * @param id The ID of the item to highlight
 * @param navigate The navigate function from react-router-dom
 * @param showToast Whether to show a toast notification
 * @returns Promise that resolves when navigation and highlighting are complete
 */
export const navigateAndHighlight = (
  type: HighlightableItemType,
  id: string,
  navigate: (path: string) => void,
  showToast: boolean = true
): Promise<boolean> => {
  // Log the navigation attempt for debugging
  console.log(`[navigateAndHighlight] Navigating to ${type} page and highlighting item ${id}`);
  
  // Get the correct route from our routeMap
  const route = routeMap[type];
  
  if (!route) {
    console.error(`[navigateAndHighlight] No route found for type: ${type}`);
    return Promise.resolve(false);
  }
  
  // First navigate to the correct page
  navigate(route);
  
  // Then wait a short delay for the navigation to complete
  // and the new page to render before highlighting
  return new Promise((resolve) => {
    setTimeout(() => {
      // Now highlight the item on the new page
      highlightItem(type, id, showToast)
        .then(result => resolve(result))
        .catch(error => {
          console.error(`[navigateAndHighlight] Error highlighting item after navigation:`, error);
          resolve(false);
        });
    }, 500); // Wait 500ms for navigation to complete before highlighting
  });
};
