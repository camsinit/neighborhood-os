
/**
 * Constants for highlight navigation
 * 
 * This file contains mapping objects used to associate item types 
 * with their respective routing and DOM attributes
 */
import { HighlightableItemType } from './types';
// Import centralized route map to avoid duplication across the app
import { ROUTE_MAP } from '@/utils/routes';

/**
 * Maps item types to their respective routes in the application
 * These are base routes that will be made neighborhood-aware by the navigation function
 *
 * Note: We re-export the centralized ROUTE_MAP under the legacy name `routeMap`
 * to maintain backward compatibility for existing imports in this folder.
 */
export const routeMap: Record<HighlightableItemType, string> = ROUTE_MAP;

/**
 * Maps item types to their data attributes for DOM selection
 */
export const dataAttributeMap: Record<HighlightableItemType, string> = {
  safety: "data-safety-id",
  event: "data-event-id", 
  skills: "data-skill-id", 
  goods: "data-goods-id",
  neighbors: "data-neighbor-id"
};

/**
 * Maps item types to readable names for error messages
 */
export const readableTypeNames: Record<HighlightableItemType, string> = {
  safety: "Safety Update",
  event: "Event", 
  skills: "Skill",
  goods: "Goods Item",
  neighbors: "Neighbor Profile"
};
