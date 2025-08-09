
/**
 * Navigate to an item and highlight it
 */
import { highlightItem } from './highlightItem';
import { HighlightableItemType } from './types';
// Import centralized route helpers to build neighborhood-aware paths safely
import { ROUTE_MAP, neighborhoodPath } from '@/utils/routes';

/**
 * Navigate to an item and highlight it
 * 
 * @param type Item type
 * @param id Item ID  
 * @param navigate React Router navigate function
 * @param showToast Whether to show a toast notification
 * @param neighborhoodId Optional neighborhood ID for neighborhood-aware routing
 */
export function navigateAndHighlight(
  type: HighlightableItemType,
  id: string,
  navigate: (path: string) => void,
  showToast: boolean = false,
  neighborhoodId?: string
): void {
  // Create neighborhood-aware route using centralized route helpers
  const basePath = ROUTE_MAP[type];
  const targetPath = neighborhoodPath(basePath, neighborhoodId);
  
  // Navigate to the appropriate route
  navigate(targetPath);
  
  // Highlight the item after a short delay to ensure component is mounted
  setTimeout(() => {
    highlightItem(type, id, showToast);
  }, 100);
}

export default navigateAndHighlight;
