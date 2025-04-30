/**
 * This file contains utility functions for handling activity metadata
 */
import { ActivityMetadata } from "./types";

/**
 * Helper function to safely check if metadata has the deleted flag
 * This handles cases where metadata might be a string or other non-object type
 */
export const isContentDeleted = (metadata: any): boolean => {
  // If metadata doesn't exist or isn't an object, it can't be deleted
  if (!metadata || typeof metadata !== 'object') {
    return false;
  }
  
  // Now that we know it's an object, check for the deleted property
  return metadata.deleted === true;
};

/**
 * Ensures metadata is an object that we can work with safely
 * This handles cases where metadata might be a string or other non-object type
 */
export const normalizeMetadata = (metadata: any): ActivityMetadata => {
  // If metadata doesn't exist or isn't an object, return an empty object
  if (!metadata || typeof metadata !== 'object') {
    return {} as ActivityMetadata;
  }
  
  // Otherwise, just cast it to ActivityMetadata
  return metadata as ActivityMetadata;
};

/**
 * Gets a description from metadata if available
 */
export const getMetadataDescription = (metadata: any): string | null => {
  if (!metadata || typeof metadata !== 'object') {
    return null;
  }
  
  return typeof metadata.description === 'string' ? metadata.description : null;
};
