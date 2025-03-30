
/**
 * Navigation and Highlighting Utility
 * 
 * This file contains utility functions for navigating to specific items
 * and highlighting them in the UI across different pages.
 */
import { toast } from "@/hooks/use-toast";
import { highlightElement } from "@/utils/highlightAnimation";

/**
 * Define all item types that can be highlighted in our application
 */
export type HighlightableItemType = 
  | "safety"    // Safety updates
  | "event"     // Calendar events
  | "support"   // Support/care requests 
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
 * Maps item types to their respective routes in the application
 */
export const routeMap: Record<HighlightableItemType, string> = {
  safety: "/safety",
  event: "/calendar", 
  support: "/care",
  skills: "/skills",
  goods: "/goods",
  neighbors: "/neighbors"
};

/**
 * Maps item types to their data attributes for DOM selection
 */
export const dataAttributeMap: Record<HighlightableItemType, string> = {
  safety: "data-safety-id",
  event: "data-event-id",
  support: "data-care-id",
  skills: "data-skill-id", 
  goods: "data-goods-id",
  neighbors: "data-neighbor-id"
};

/**
 * Dispatch a highlight event to highlight a specific item
 * 
 * @param type The type of item to highlight
 * @param id The ID of the item to highlight
 * @param showToast Whether to show a toast notification when highlighting occurs
 */
export const highlightItem = (
  type: HighlightableItemType, 
  id: string,
  showToast: boolean = false
): void => {
  // Create and dispatch a custom event
  const event = new CustomEvent('highlightItem', {
    detail: {
      type,
      id
    }
  });
  
  // Dispatch the event
  window.dispatchEvent(event);
  
  // Show a toast notification if requested
  if (showToast) {
    toast({
      title: "Item Located",
      description: `Navigating to the requested item`,
      duration: 3000,
    });
  }
  
  // After a short delay, attempt to find and highlight the element directly
  setTimeout(() => {
    const selector = `[${dataAttributeMap[type]}="${id}"]`;
    highlightElement(selector);
  }, 300);
};

/**
 * Generate a page-specific listener for highlighting items
 * 
 * @param itemType The type of item this page displays
 * @returns An event listener function for the highlightItem event
 */
export const createHighlightListener = (
  itemType: HighlightableItemType
): ((e: Event) => void) => {
  return (e: Event) => {
    // Cast to CustomEvent to access the detail property
    const customEvent = e as CustomEvent<HighlightItemDetail>;
    const { type, id } = customEvent.detail;
    
    // Only process events for this page's item type
    if (type !== itemType) return;
    
    // Find the element with the appropriate data attribute
    const selector = `[${dataAttributeMap[type]}="${id}"]`;
    
    // Use the highlight animation utility
    highlightElement(selector);
  };
};
