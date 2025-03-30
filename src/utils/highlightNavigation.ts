
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
 * Maps item types to readable names for error messages
 */
export const readableTypeNames: Record<HighlightableItemType, string> = {
  safety: "Safety Update",
  event: "Event", 
  support: "Care Request",
  skills: "Skill",
  goods: "Goods Item",
  neighbors: "Neighbor Profile"
};

/**
 * Dispatch a highlight event to highlight a specific item
 * 
 * @param type The type of item to highlight
 * @param id The ID of the item to highlight
 * @param showToast Whether to show a toast notification when highlighting occurs
 * @returns Promise that resolves when highlighting is complete (or fails)
 */
export const highlightItem = (
  type: HighlightableItemType, 
  id: string,
  showToast: boolean = false
): Promise<boolean> => {
  // Create a promise that resolves when highlighting is complete or fails
  return new Promise((resolve) => {
    try {
      // Validate inputs
      if (!type || !id) {
        console.error("[highlightItem] Missing required parameters:", { type, id });
        
        if (showToast) {
          toast({
            title: "Error highlighting item",
            description: "Invalid item information provided.",
            variant: "destructive",
          });
        }
        
        resolve(false);
        return;
      }
      
      console.log(`[highlightItem] Attempting to highlight ${type} with id ${id}`);
      
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
          title: `Locating ${readableTypeNames[type]}`,
          description: "Navigating to the requested item",
          duration: 3000,
        });
      }
      
      // After a short delay, attempt to find and highlight the element directly
      setTimeout(() => {
        // Get the appropriate selector
        const selector = `[${dataAttributeMap[type]}="${id}"]`;
        
        // Attempt to find and highlight the element
        const result = highlightElement(selector, showToast);
        
        // Resolve with the result
        resolve(result);
      }, 300);
    } catch (error) {
      console.error("[highlightItem] Error during highlighting:", error);
      
      if (showToast) {
        toast({
          title: "Error highlighting item",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      }
      
      resolve(false);
    }
  });
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
    try {
      // Cast to CustomEvent to access the detail property
      const customEvent = e as CustomEvent<HighlightItemDetail>;
      const { type, id } = customEvent.detail;
      
      // Only process events for this page's item type
      if (type !== itemType) return;
      
      console.log(`[createHighlightListener:${itemType}] Received highlight request for id:`, id);
      
      // Find the element with the appropriate data attribute
      const selector = `[${dataAttributeMap[type]}="${id}"]`;
      
      // First try to find the element immediately
      let element = document.querySelector(selector);
      
      if (element) {
        // If found immediately, highlight it
        highlightElement(selector);
      } else {
        // If not found immediately, try again after a short delay
        // (helpful for elements that are being rendered asynchronously)
        console.log(`[createHighlightListener:${itemType}] Element not found immediately, retrying...`);
        
        // Try multiple times with increasing delays
        const retryDelays = [100, 300, 500, 1000];
        let retryCount = 0;
        
        const attemptHighlight = () => {
          if (retryCount >= retryDelays.length) {
            // All retries failed
            console.warn(`[createHighlightListener:${itemType}] Failed to find element after ${retryDelays.length} retries`);
            
            toast({
              title: `${readableTypeNames[type]} Not Found`,
              description: "The item you're looking for might have been removed or is not on this page.",
              variant: "destructive",
            });
            
            return;
          }
          
          element = document.querySelector(selector);
          
          if (element) {
            // Element found, highlight it
            highlightElement(selector);
          } else {
            // Try again after the next delay
            const nextDelay = retryDelays[retryCount++];
            console.log(`[createHighlightListener:${itemType}] Retry ${retryCount} after ${nextDelay}ms`);
            setTimeout(attemptHighlight, nextDelay);
          }
        };
        
        // Start the retry process
        setTimeout(attemptHighlight, retryDelays[retryCount++]);
      }
    } catch (error) {
      console.error(`[createHighlightListener:${itemType}] Error processing highlight event:`, error);
    }
  };
};
