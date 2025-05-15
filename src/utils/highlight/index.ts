import { useNavigate } from "react-router-dom";

import { type HighlightableItemType } from "./types";
import { createLogger } from "../logger";

// Initialize logger
const logger = createLogger('highlight');

// Get the router
const router = {
  navigate: useNavigate()
};

/**
 * Highlights an item in the UI based on its type and id
 * 
 * @param type - The type of item to highlight (event, safety, etc)
 * @param id - The id of the item to highlight
 * @param navigateToPage - Whether to navigate to the page containing the item
 */
export function highlightItem(type: HighlightableItemType, id: string, navigateToPage = true): void {
  // Log the highlight request
  logger.debug(`Highlighting item of type ${type} with id ${id}`);

  // Validate parameters
  if (!type || !id) {
    logger.warn('Invalid parameters passed to highlightItem');
    return;
  }

  // Handle different item types for navigation
  if (navigateToPage) {
    switch (type) {
      case "event":
        // Navigate to the event details page
        router.navigate(`/events/${id}`);
        break;
      case "safety": 
        // Navigate to the safety update details page
        router.navigate(`/safety/${id}`);
        break;
      case "skills":
        // Navigate to the skills exchange details page
        router.navigate(`/skills/${id}`);
        break;
      case "goods":
        // Navigate to the goods exchange details page
        router.navigate(`/goods/${id}`);
        break;
      case "neighbors":
        // Navigate to the neighbors page
        router.navigate("/neighbors");
        break;
      default:
        // Log a warning for unhandled types
        logger.warn(`Unhandled highlight type: ${type}`);
        break;
    }
  }

  // Create and dispatch the highlight event
  const highlightEvent = new CustomEvent('highlightItem', {
    detail: { type, id }
  });
  
  // Dispatch the event on the window
  window.dispatchEvent(highlightEvent);

  // Log the event dispatch
  logger.debug(`Dispatched highlight event for type ${type} with id ${id}`);

  // Set a timeout to remove the highlight after a delay
  setTimeout(() => {
    const removeHighlightEvent = new CustomEvent('removeHighlight', {
      detail: { type, id }
    });
    window.dispatchEvent(removeHighlightEvent);
  }, 3000);
}

/**
 * Creates a highlight listener for a specific item type
 * 
 * @param itemType - The type of item to listen for (event, safety, etc)
 * @returns An event listener function
 */
export const createHighlightListener = (itemType: HighlightableItemType) => {
  return (event: Event) => {
    if (!(event instanceof CustomEvent)) {
      return;
    }

    const { type, id } = event.detail;

    if (type !== itemType) {
      return;
    }

    // Find the element by its data attribute
    const element = document.querySelector(`[data-${itemType}-id="${id}"]`);

    if (element) {
      // Add a class to highlight the element
      element.classList.add('highlighted-item');

      // After a delay, remove the highlight class
      setTimeout(() => {
        element.classList.remove('highlighted-item');
      }, 2000);
    }
  };
};

/**
 * Removes the highlight from an item in the UI based on its type and id
 * 
 * @param type - The type of item to remove highlight from
 * @param id - The id of the item to remove highlight from
 */
export function removeHighlight(type: HighlightableItemType, id: string): void {
  // Find the element by its data attribute
  const element = document.querySelector(`[data-${type}-id="${id}"]`);

  if (element) {
    // Remove the highlight class from the element
    element.classList.remove('highlighted-item');
  }
}
