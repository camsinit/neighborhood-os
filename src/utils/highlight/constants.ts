
/**
 * Constants for the highlight system
 * 
 * This file contains route mappings and configuration for the highlight system.
 */
import { HighlightableItemType } from './types';

// Map item types to their respective routes
export const routeMap: Record<HighlightableItemType, string> = {
  event: '/calendar',
  safety: '/safety',
  skills: '/skills',
  goods: '/goods',
  neighbors: '/neighbors'
};

// Animation configuration for highlighted items
export const highlightConfig = {
  duration: 2000,       // Duration of highlight in milliseconds
  color: '#FBBF24',     // Amber color for highlight
  fadeDuration: 500     // Fade out duration in milliseconds
};

// Delay before scrolling to an element
export const scrollDelay = 200;  // milliseconds

// Map item types to their respective data attributes
export const dataAttributeMap: Record<HighlightableItemType, string> = {
  event: 'event-id',
  safety: 'update-id',
  skills: 'skill-id',
  goods: 'goods-id',
  neighbors: 'neighbor-id'
};

// Readable names for item types (for notifications)
export const readableTypeNames: Record<HighlightableItemType, string> = {
  event: 'Event',
  safety: 'Safety Update',
  skills: 'Skill',
  goods: 'Goods Item',
  neighbors: 'Neighbor'
};
