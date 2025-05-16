
/**
 * Types for the highlight system
 */

/**
 * Valid item types that can be highlighted
 */
export type HighlightableItemType = 
  | 'event'
  | 'skill'  
  | 'goods'
  | 'safety'
  | 'care'
  | 'neighbor'
  | 'profile';

/**
 * Detail object for highlighting
 * 
 * Contains all the information needed to highlight an item
 */
export interface HighlightItemDetail {
  itemType: HighlightableItemType;
  itemId: string;
}

/**
 * CSS class names used by the highlight system
 */
export const highlightClassNames = {
  active: 'active',
  item: 'highlight-item'
};

/**
 * Result interface for useHighlightedItem hook
 */
export interface UseHighlightedItemResult {
  id: string | null;
  isHighlighted: boolean;
  clearHighlight: () => void;
}

