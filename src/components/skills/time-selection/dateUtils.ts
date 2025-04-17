
/**
 * Utility functions for date handling in time slot selection
 * 
 * NOTICE: This file is being retained for backward compatibility.
 * New code should use the centralized date utilities in src/utils/dateUtils.ts
 */

// Re-export the functions from the central utilities
export { 
  normalizeDate, 
  getUniqueDatesCount, 
  logDateDetails,
  formatDateForDisplay 
} from '@/utils/dateUtils';
