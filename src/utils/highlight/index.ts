
/**
 * Highlight utilities
 * 
 * This module provides functions for highlighting items in the UI.
 */
import { createLogger } from '@/utils/logger';
import { HighlightableItemType, HighlightItemDetail } from './types';
import { highlightItem } from './highlightItem';
import { navigateAndHighlight } from './navigateAndHighlight';
import { createHighlightListener } from './createHighlightListener';

// Create a logger for this module
const logger = createLogger('highlight');

// Re-export types for convenience
export type { HighlightableItemType, HighlightItemDetail };

// Re-export functions from their dedicated files
export { highlightItem, navigateAndHighlight, createHighlightListener };

// Export default for compatibility with import default syntax
export default {
  highlightItem,
  navigateAndHighlight,
  createHighlightListener
};
