
// Define the types of items that can be highlighted
// This is used for navigation and highlighting specific items in the UI
export type HighlightableItemType = 
  | "event" 
  | "safety" 
  | "skills" 
  | "goods" 
  | "freebies"
  | "support" 
  | "neighbors";

// Map each type to its corresponding route
export const routeMap: Record<HighlightableItemType, string> = {
  event: "/calendar",
  safety: "/safety",
  skills: "/skills",
  goods: "/freebies", // Redirecting goods to freebies
  freebies: "/freebies",
  support: "/support",
  neighbors: "/neighbors"
};

// Human-readable names for each item type
export const readableTypeNames: Record<HighlightableItemType, string> = {
  event: "Event",
  safety: "Safety Update",
  skills: "Skill",
  goods: "Item",
  freebies: "Freebie",
  support: "Support Request",
  neighbors: "Neighbor"
};

/**
 * Function to create a highlight listener for a specific module type
 * This is used to handle navigation events and highlight items in the UI
 */
export const createHighlightListener = (moduleType: string) => {
  return (event: Event) => {
    // Handle both /freebies and /goods routes mapping to the same freebies module
    if (moduleType === 'freebies' && (window.location.pathname.includes('/goods') || window.location.pathname.includes('/freebies'))) {
      return;
    }
    
    // Only handle events for routes matching the module type
    if (!window.location.pathname.includes(`/${moduleType}`)) {
      window.location.href = `/${moduleType}?forceHideBadge=true`;
    }
  };
};

/**
 * Highlights a specific item in the UI
 * @param type - The type of item to highlight
 * @param id - The ID of the item to highlight
 * @param scrollToView - Whether to scroll to the item
 * @returns A promise that resolves when the highlighting is complete
 */
export const highlightItem = async (
  type: HighlightableItemType, 
  id: string, 
  scrollToView: boolean = true
): Promise<boolean> => {
  try {
    // Create a custom event to highlight the item
    const event = new CustomEvent("highlightItem", {
      detail: { type, id, scrollToView },
    });
    
    // Dispatch the event
    window.dispatchEvent(event);
    
    // Wait for a short time to allow the highlighting to take effect
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return true to indicate success
    return true;
  } catch (error) {
    console.error(`Failed to highlight item: ${type}/${id}`, error);
    return false;
  }
};
