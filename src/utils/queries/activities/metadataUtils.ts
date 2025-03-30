
/**
 * This file contains utility functions for handling activity metadata
 */
import { ActivityMetadata } from "./types";

/**
 * Helper function to safely check if metadata has the deleted flag
 * This handles cases where metadata might be a string or other non-object type
 */
export const isContentDeleted = (metadata: any): boolean => {
  // Check if metadata exists and is an object
  if (!metadata || typeof metadata !== 'object') return false;
  
  // Now we can safely check for the deleted property
  return metadata.deleted === true;
};

/**
 * Ensures metadata is an object that we can work with safely
 * This handles cases where metadata might be a string or other non-object type
 */
export const normalizeMetadata = (metadata: any): ActivityMetadata => {
  return typeof metadata === 'object' && metadata !== null
    ? metadata as ActivityMetadata
    : {} as ActivityMetadata;
};
