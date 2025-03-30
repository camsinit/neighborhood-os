
/**
 * Highlight Animation Utilities
 * 
 * This file contains utility functions for creating visual highlighting 
 * effects throughout the application
 */
import { toast } from "@/hooks/use-toast";

/**
 * Adds a rainbow highlight animation to an element
 * 
 * @param element The DOM element to highlight
 */
export const addRainbowHighlight = (element: HTMLElement | null) => {
  // Return early if no element is provided
  if (!element) {
    console.error("[addRainbowHighlight] Cannot add highlight to null element");
    return;
  }
  
  // Add rainbow animation class
  element.classList.add('rainbow-highlight');
  
  // Log for debugging
  console.log(`[addRainbowHighlight] Added highlight to element:`, element);
  
  // Remove the animation class after 5 seconds (as requested)
  setTimeout(() => {
    element.classList.remove('rainbow-highlight');
    console.log(`[addRainbowHighlight] Removed highlight from element:`, element);
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
  // Log attempt for debugging
  console.log(`[highlightElement] Attempting to highlight element with selector: ${selector}`);
  
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
        
        // Log success for debugging
        console.log(`[highlightElement] Successfully highlighted element: ${selector}`);
        return true;
      } else {
        // Log failure for debugging
        console.warn(`[highlightElement] Could not find element: ${selector}`);
        
        // Show error toast if requested
        if (showErrorToast) {
          toast({
            title: "Item not found",
            description: "The requested item could not be found on this page.",
            variant: "destructive",
          });
        }
        
        return false;
      }
    } catch (error) {
      // Log any errors that occur during highlighting
      console.error(`[highlightElement] Error highlighting element: ${selector}`, error);
      
      // Show error toast if requested
      if (showErrorToast) {
        toast({
          title: "Highlighting error",
          description: "An error occurred while attempting to highlight the item.",
          variant: "destructive",
        });
      }
      
      return false;
    }
  }, 100);
  
  // Return false by default since the actual highlighting happens asynchronously
  return false;
};

/**
 * Adds a scale animation to an element (useful for button clicks)
 * 
 * @param element The DOM element to animate
 */
export const addScaleAnimation = (element: HTMLElement | null) => {
  // Return early if no element is provided
  if (!element) {
    console.error("[addScaleAnimation] Cannot add animation to null element");
    return;
  }
  
  // Add scale animation class
  element.classList.add('scale-animation');
  
  // Remove the animation class after animation completes
  setTimeout(() => {
    element.classList.remove('scale-animation');
  }, 300);
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
