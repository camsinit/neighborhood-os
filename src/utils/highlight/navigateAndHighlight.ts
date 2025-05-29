
/**
 * Navigate to an item and highlight it
 */
import { routeMap } from './constants';
import { highlightItem } from './highlightItem';
import { HighlightableItemType } from './types';

/**
 * Navigate to an item and highlight it
 * 
 * @param type Item type
 * @param id Item ID  
 * @param navigate React Router navigate function
 * @param showToast Whether to show a toast notification
 */
export function navigateAndHighlight(
  type: HighlightableItemType,
  id: string,
  navigate: (path: string) => void,
  showToast: boolean = false
): void {
  // Navigate to the appropriate route
  navigate(routeMap[type]);
  
  // Highlight the item after a short delay to ensure component is mounted
  setTimeout(() => {
    highlightItem(type, id, showToast);
  }, 100);
}

export default navigateAndHighlight;
