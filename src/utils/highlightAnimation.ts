
/**
 * Highlight Animation Utilities
 * 
 * This file contains utility functions for creating visual highlighting 
 * effects throughout the application
 */
import { toast } from "sonner";
import { createLogger } from '@/utils/logger';

// Create a dedicated logger for this utility
const logger = createLogger('highlightAnimation');

/**
 * Adds a rainbow highlight animation to an element
 * 
 * @param element The DOM element to highlight
 */
export const addRainbowHighlight = (element: HTMLElement | null) => {
  // Return early if no element is provided
  if (!element) {
    logger.error("[addRainbowHighlight] Cannot add highlight to null element");
    return;
  }
  
  // Add rainbow animation class
  element.classList.add('rainbow-highlight');
  
  logger.debug(`[addRainbowHighlight] Added highlight to element:`, element);
  
  // Remove the animation class after 5 seconds
  setTimeout(() => {
    element.classList.remove('rainbow-highlight');
    logger.debug(`[addRainbowHighlight] Removed highlight from element:`, element);
  }, 5000);
};

/**
 * Helper to find and highlight elements by CSS selector
 * 
 * @param selector The CSS selector to find the element
 * @param showErrorToast Whether to show an error toast when element not found
 * @return True if the element was found and highlighted, false otherwise
 */
export const highlightElement = (selector: string, showErrorToast: boolean = false): boolean => {
  logger.debug(`[highlightElement] Attempting to highlight element with selector: ${selector}`);
  
  // Use small delay to ensure DOM is ready
  setTimeout(() => {
    try {
      // Find the element
      const element = document.querySelector(selector);
      
      if (element) {
        // Scroll the element into view (centered)
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add the rainbow highlight animation
        addRainbowHighlight(element as HTMLElement);
        
        logger.debug(`[highlightElement] Successfully highlighted element: ${selector}`);
        return true;
      } else {
        logger.warn(`[highlightElement] Could not find element: ${selector}`);
        
        // Show error toast if requested
        if (showErrorToast) {
          toast("Item not found", {
            description: "The requested item could not be found on this page."
          });
        }
        
        return false;
      }
    } catch (error) {
      // Log any errors that occur during highlighting
      logger.error(`[highlightElement] Error highlighting element: ${selector}`, error);
      
      // Show error toast if requested
      if (showErrorToast) {
        toast("Highlighting error", {
          description: "An error occurred while attempting to highlight the item."
        });
      }
      
      return false;
    }
  }, 100);
  
  // Return false by default since the actual highlighting happens asynchronously
  return false;
};

/**
 * CSS to add to your global styles:
 * 
 * .rainbow-highlight {
 *   animation: glow-pulse 5s ease-in-out;
 *   outline: 3px solid transparent;
 *   box-shadow: 0 0 15px rgba(74, 222, 128, 0.6);
 *   position: relative;
 *   z-index: 10;
 * }
 * 
 * @keyframes glow-pulse {
 *   0% { 
 *     outline-color: rgba(74, 222, 128, 0.7);
 *     box-shadow: 0 0 15px rgba(74, 222, 128, 0.7); 
 *   }
 *   50% { 
 *     outline-color: rgba(59, 130, 246, 0.7);
 *     box-shadow: 0 0 15px rgba(59, 130, 246, 0.7); 
 *   }
 *   100% { 
 *     outline-color: rgba(74, 222, 128, 0);
 *     box-shadow: 0 0 15px rgba(74, 222, 128, 0); 
 *   }
 * }
 */

