
/**
 * Legacy highlight utility file
 * This file re-exports from the new highlight module structure
 * for backwards compatibility
 */
import { createLogger } from '@/utils/logger';
import { 
  highlightItem,
  createHighlightListener,
  navigateAndHighlight
} from './highlight/index';

// Re-export for backwards compatibility
export {
  highlightItem,
  createHighlightListener,
  navigateAndHighlight
};

// Export default for backward compatibility
export default { 
  highlightItem, 
  createHighlightListener,
  navigateAndHighlight
};
