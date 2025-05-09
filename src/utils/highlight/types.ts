
/**
 * Types for the highlight navigation functionality
 * 
 * This file contains type definitions used across the highlight feature
 */

/**
 * Define all item types that can be highlighted in our application
 */
export type HighlightableItemType = 
  | "safety"    // Safety updates
  | "event"     // Calendar events
  | "skills"    // Skills exchange
  | "goods"     // Goods exchange items
  | "neighbors"; // Neighbor profiles

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
