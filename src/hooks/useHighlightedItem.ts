
/**
 * Hook to track highlighted items
 * 
 * This hook allows components to react when an item is highlighted via the
 * highlight system. Components use this to scroll to and visually highlight
 * specific items in lists or views.
 */
import { useEffect, useState } from 'react';
// Fix imports to use the correct paths
import { createHighlightListener } from '@/utils/highlight/createHighlightListener';
import { HighlightableItemType, UseHighlightedItemResult } from '@/utils/highlight/types';
import { createLogger } from '@/utils/logger';

// Create a dedicated logger for this hook
const logger = createLogger('useHighlightedItem');

/**
 * Hook to handle item highlighting in components
 * 
 * @param type - The type of item this component handles
 * @returns Object with highlighted ID and related functions
 */
export function useHighlightedItem(type: HighlightableItemType): UseHighlightedItemResult {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  
  useEffect(() => {
    logger.debug(`Setting up highlight listener for ${type} items`);
    
    // Create a listener for highlight events that match this component's type
    const removeListener = createHighlightListener((detail) => {
      if (detail.type === type) {
        logger.debug(`Highlighting ${type} item with ID: ${detail.id}`);
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
