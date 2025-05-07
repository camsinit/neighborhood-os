
/**
 * Utility functions for dispatching refresh events
 * 
 * These functions can be called from anywhere in the application
 * to trigger data refreshes in components that are listening for them.
 */

/**
 * Dispatch a custom event to trigger data refresh
 * 
 * This function provides a consistent way to notify components about data changes
 * without tight coupling between components.
 * 
 * @param eventName - The name of the event to dispatch
 * @param detail - Optional details to include with the event
 */
export const dispatchRefreshEvent = (
  eventName: string, 
  detail?: Record<string, any>
) => {
  if (detail) {
    // Create a custom event with details
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  } else {
    // Create a simple event
    const event = new Event(eventName);
    document.dispatchEvent(event);
  }
  
  console.log(`Dispatched refresh event: ${eventName}`);
};

/**
 * Predefined refresh events for different sections of the app
 * 
 * Using these predefined functions ensures consistency in event naming
 * across different parts of the application.
 */
export const refreshEvents = {
  goods: () => dispatchRefreshEvent('goods-form-submitted'),
  safety: () => dispatchRefreshEvent('safety-update-submitted'),
  events: () => dispatchRefreshEvent('event-submitted'),
  eventsDelete: () => {
    // Dispatch both the event-deleted event for data refresh
    dispatchRefreshEvent('event-deleted');
    
    // And dispatch a DOM event for UI cleanup
    // This is crucial for fixing the overlay issue
    document.dispatchEvent(new Event('event-deleted'));
    
    // Force cleanup of any leftover Radix UI overlays
    setTimeout(() => {
      const overlays = document.querySelectorAll('[data-state="open"].fixed.inset-0');
      overlays.forEach(element => {
        element.remove();
      });
    }, 300);
  },
  eventsUpdate: () => dispatchRefreshEvent('event-updated'),
  skills: () => dispatchRefreshEvent('skill-submitted'),
  profile: () => dispatchRefreshEvent('profile-updated'),
};

/**
 * Get the global query client instance
 * 
 * This provides direct access to the query client for manual invalidations
 * when the component doesn't have access to the useQueryClient hook.
 */
