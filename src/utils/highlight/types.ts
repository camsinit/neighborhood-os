
/**
 * Types for the highlight navigation functionality
 * 
 * This file contains type definitions used across the highlight feature
 */

/**
 * Define all item types that can be highlighted in our application
 * We're using a string literal union with a string type to allow for both 
 * our predefined types AND any string value that might come from the database
 */
export type HighlightableItemType = 
  | "safety"    // Safety updates
  | "event"     // Calendar events
  | "skills"    // Skills exchange
  | "goods"     // Goods exchange items
  | "neighbors" // Neighbor profiles
  | "support"   // Support requests
  | string;     // Allow other string values for flexibility

/**
 * Interface for the highlight event detail payload
 */
export interface HighlightItemDetail {
  type: HighlightableItemType;
  id: string;
}

/**
 * Interface for mapping item types to routes
 */
export interface RouteMapping {
  [key: string]: string;
}

/**
 * Interface for mapping item types to data attributes
 */
export interface DataAttributeMapping {
  [key: string]: string;
}

/**
 * Interface for mapping item types to readable names
 */
export interface ReadableNameMapping {
  [key: string]: string;
}
