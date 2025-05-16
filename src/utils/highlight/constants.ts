
/**
 * Constants for the highlight system
 * 
 * This file contains constants used throughout the highlight system,
 * including data attributes, route mappings, etc.
 */

import { HighlightableItemType } from "./types";

/**
 * Data attributes for each highlightable item type
 * 
 * These attributes are added to DOM elements to make them findable
 * by the highlight system.
 */
export const dataAttributeMap: Record<HighlightableItemType, string> = {
  event: 'event-id',
  skill: 'skill-id',
  goods: 'goods-id',
  safety: 'update-id',  // We're keeping "safety" for backwards compatibility
  care: 'care-id',
  neighbor: 'neighbor-id',
  profile: 'profile-id'
};

/**
 * Route mapping for each highlightable item type
 * 
 * These routes are used to navigate to the correct page when
 * highlighting an item.
 */
export const routeMap: Record<HighlightableItemType, string> = {
  event: '/calendar',
  skill: '/skills',
  goods: '/goods',
  safety: '/safety',
  care: '/care',
  neighbor: '/neighbors',
  profile: '/profile'
};

/**
 * Human-readable names for each item type
 * 
 * These are used in toast notifications and other user-facing messages.
 */
export const readableTypeNames: Record<HighlightableItemType, string> = {
  event: 'Event',
  skill: 'Skill',
  goods: 'Item',
  safety: 'Update',  // Changed from "Safety Update" to just "Update"
  care: 'Care Request',
  neighbor: 'Neighbor',
  profile: 'Profile'
};
