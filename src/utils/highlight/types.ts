
/**
 * Types for the highlight system
 */

// Valid item types that can be highlighted in the UI
export type HighlightableItemType = 
  | 'event' 
  | 'safety' 
  | 'skills' 
  | 'goods' 
  | 'neighbors';

// Structure for a highlight event
export interface HighlightItemDetail {
  type: HighlightableItemType;
  id: string;
}

// Hook result type for highlighted items
export interface UseHighlightedItemResult {
  id: string | null;
  isHighlighted: boolean;
  clearHighlight: () => void;
}
