
/**
 * Highlight utilities - Updated for Unified Navigation System
 * 
 * This module now serves as the main entry point for the highlight system
 * with unified navigation service integration.
 */
import { createLogger } from '@/utils/logger';
import { highlightItem as coreHighlightItem } from './highlightItem';
import { createHighlightListener } from './createHighlightListener';
import { navigateAndHighlight as legacyNavigateAndHighlight } from '@/services/navigation/ItemNavigationService';

// Re-export types
export type { HighlightableItemType, HighlightItemDetail } from './types';

// Create a logger for this module
const logger = createLogger('highlight-index');

/**
 * Main highlight function - delegates to core implementation
 */
export const highlightItem = coreHighlightItem;

/**
 * Create highlight event listeners
 */
export { createHighlightListener };

/**
 * Navigate and highlight - now uses unified service
 * This is maintained for backward compatibility
 */
export const navigateAndHighlight = legacyNavigateAndHighlight;

// Log when this module is imported
logger.info('Highlight system initialized with unified navigation service');

// Default export for backward compatibility
export default {
  highlightItem,
  createHighlightListener,
  navigateAndHighlight
};
