
import { createLogger } from '@/utils/logger';

// Import all highlight functions and types
import { highlightItem } from './highlightItem';
import { createHighlightListener } from './createHighlightListener';
import { navigateAndHighlight } from './navigateAndHighlight';
import { type HighlightableItemType, type HighlightItemDetail } from './types';

// Initialize logger
const logger = createLogger('highlight');

// Export all the highlight functions and types
export {
  highlightItem,
  createHighlightListener,
  navigateAndHighlight,
  // Explicitly export the types
  type HighlightableItemType,
  type HighlightItemDetail
};

// Export default object with all functions for backward compatibility
export default {
  highlightItem,
  createHighlightListener,
  navigateAndHighlight
};
