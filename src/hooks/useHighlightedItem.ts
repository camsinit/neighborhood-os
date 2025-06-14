
/**
 * Hook to track highlighted items
 * 
 * This hook allows components to react when an item is highlighted via the
 * highlight system. Components use this to scroll to and visually highlight
 * specific items in lists or views.
 */
import { useEffect, useState } from 'react';
import { createHighlightListener, HighlightableItemType } from '@/utils/highlight';
import { UseHighlightedItemResult } from '@/utils/highlight/types';

/**
 * Hook to handle item highlighting in components
 * 
 * @param type - The type of item this component handles
 * @returns Object with highlighted ID and related functions
 */
export function useHighlightedItem(type: HighlightableItemType): UseHighlightedItemResult {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  
  useEffect(() => {
    // Create a listener for highlight events that match this component's type
    // Fix: Correct the function call and parameter types
    const removeListener = createHighlightListener((detail: any) => {
      if (detail.type === type) {
        setHighlightedId(detail.id);
      }
    });
    
    // Clean up listener on unmount
    return removeListener;
  }, [type]);
  
  // Function to clear the current highlight state
  const clearHighlight = () => setHighlightedId(null);
  
  return {
    id: highlightedId, 
    isHighlighted: highlightedId !== null,
    clearHighlight
  };
}

export default useHighlightedItem;
