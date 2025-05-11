
/**
 * Main export file for highlight navigation utilities
 * 
 * This file re-exports all the necessary functions and types
 * for using the highlight navigation feature
 */

// Export types
export type { 
  HighlightableItemType,
  HighlightItemDetail
} from './types';

// Export constants
export { 
  routeMap,
  dataAttributeMap,
  readableTypeNames
} from './constants';

// Export functions
export { 
  highlightItem 
} from './highlightItem';

export { 
  createHighlightListener 
} from './createHighlightListener';

// Export our new navigation utility
export {
  navigateAndHighlight
} from './navigateAndHighlight';
