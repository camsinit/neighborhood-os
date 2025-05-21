
/**
 * Highlight listener functionality
 * 
 * This file contains functions for creating event listeners
 * that respond to highlight events
 */
import { toast } from "@/hooks/use-toast";
import { highlightElement } from "@/utils/highlightAnimation";
import { HighlightableItemType, HighlightItemDetail } from './types';
import { dataAttributeMap, readableTypeNames } from './constants';

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
