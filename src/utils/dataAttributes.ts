
/**
 * Data Attribute Utilities
 * 
 * This module provides utilities for adding consistent data attributes
 * to content items across the application for highlighting and navigation.
 */
import { HighlightableItemType } from '@/utils/highlight/types';

/**
 * Standard data attribute patterns for each content type
 */
const DATA_ATTRIBUTE_MAP: Record<HighlightableItemType, string> = {
  event: 'data-event-id',
  safety: 'data-safety-id', 
  skills: 'data-skill-id',
  goods: 'data-goods-id',
  neighbors: 'data-neighbor-id',
  group: 'data-group-id'
};

/**
 * Generate data attributes for a content item
 * 
 * @param type - The type of content item
 * @param id - The unique identifier for the item
 * @returns Object with data attribute key-value pairs
 */
export const generateDataAttributes = (
  type: HighlightableItemType,
  id: string
): Record<string, string> => {
  const attributeName = DATA_ATTRIBUTE_MAP[type];
  if (!attributeName) {
    console.warn(`No data attribute pattern defined for type: ${type}`);
    return {};
  }
  
  return {
    [attributeName]: id
  };
};

/**
 * Generate data attributes with additional custom attributes
 * 
 * @param type - The type of content item
 * @param id - The unique identifier for the item  
 * @param additionalAttributes - Additional HTML attributes to include
 * @returns Combined object with all attributes
 */
export const generateDataAttributesWithExtras = (
  type: HighlightableItemType,
  id: string,
  additionalAttributes: Record<string, string> = {}
): Record<string, string> => {
  return {
    ...generateDataAttributes(type, id),
    ...additionalAttributes
  };
};

/**
 * Hook-style utility for React components
 * Returns props object that can be spread onto JSX elements
 * 
 * @param type - The type of content item
 * @param id - The unique identifier for the item
 * @returns Props object ready to spread
 */
export const useDataAttributes = (
  type: HighlightableItemType,
  id: string
) => {
  return generateDataAttributes(type, id);
};

/**
 * Get the selector string for finding an element by its data attribute
 * 
 * @param type - The type of content item
 * @param id - The unique identifier for the item
 * @returns CSS selector string
 */
export const getSelectorForItem = (
  type: HighlightableItemType,
  id: string
): string => {
  const attributeName = DATA_ATTRIBUTE_MAP[type];
  return `[${attributeName}="${id}"]`;
};

/**
 * Validate that a content item has the correct data attributes
 * Useful for testing and debugging
 * 
 * @param element - DOM element to check
 * @param type - Expected content type
 * @param id - Expected ID
 * @returns true if element has correct attributes
 */
export const validateDataAttributes = (
  element: HTMLElement,
  type: HighlightableItemType,
  id: string
): boolean => {
  const attributeName = DATA_ATTRIBUTE_MAP[type];
  const actualValue = element.getAttribute(attributeName);
  return actualValue === id;
};

export default {
  generateDataAttributes,
  generateDataAttributesWithExtras,
  useDataAttributes,
  getSelectorForItem,
  validateDataAttributes
};
