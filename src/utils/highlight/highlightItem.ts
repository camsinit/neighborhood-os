
/**
 * Main highlight item functionality
 * 
 * This file contains functions for highlighting specific items in the UI
 */
import { toast } from "@/hooks/use-toast";
import { highlightElement } from "@/utils/highlightAnimation";
import { HighlightableItemType } from './types';
import { readableTypeNames, dataAttributeMap } from './constants';

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
