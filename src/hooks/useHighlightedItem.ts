
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
    // Create the event listener function for this item type
    const eventListener = createHighlightListener(type);
    
    // Add the event listener to listen for highlight events
    document.addEventListener('highlightItem', eventListener);
    
    // Return cleanup function to remove the event listener
    return () => {
      document.removeEventListener('highlightItem', eventListener);
    };
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
