
/**
 * Highlight listener creation utility
 * 
 * This file provides a function to create event listeners for
 * highlighting items in response to custom events.
 */
import { highlightItem } from "./highlightItem";
import { HighlightableItemType } from "./types";

/**
 * Creates an event listener for highlighting items
 * 
 * @param itemType The type of items this listener should highlight
 * @param eventName The name of the custom event to listen for
 * @returns A cleanup function to remove the event listener
 */
export const createHighlightListener = (
  itemType: HighlightableItemType,
  eventName: string = `highlight-${itemType}`
): () => void => {
  // The event handler function
  const handleHighlightEvent = (event: CustomEvent<{ id: string }>) => {
    if (!event.detail || !event.detail.id) return;
    
    // Highlight the item with the provided ID
    highlightItem(itemType, event.detail.id, true);
  };
  
  // Add the event listener
  window.addEventListener(
    eventName, 
    handleHighlightEvent as EventListener
  );
  
  // Return a cleanup function
  return () => {
    window.removeEventListener(
      eventName, 
      handleHighlightEvent as EventListener
    );
  };
};
