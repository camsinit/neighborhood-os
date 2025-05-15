
/**
 * Legacy highlight utility file
 * This file re-exports from the new highlight module structure
 * for backwards compatibility
 */
import { createLogger } from '@/utils/logger';

// Import only what we need from the new structure
import {
  highlightItem,
  navigateAndHighlight
} from './highlight/index';

// Create a logger for this module
const logger = createLogger('highlight-legacy');

// Log deprecation warning when this file is imported
logger.warn('This highlight.ts file is deprecated. Import directly from @/utils/highlight/index.ts instead');

// Re-export for backwards compatibility
export {
  highlightItem,
  navigateAndHighlight
};

// Export default for backward compatibility
export default {
  highlightItem, 
  navigateAndHighlight
};
