
/**
 * This file contains utilities for dispatching refresh events
 * across the application. These events are used to trigger refetching
 * of data in components that display dynamic content.
 */

/**
 * Dispatches a custom event to trigger a refresh of various components
 * 
 * @param eventName - The name of the refresh event
 */
export const dispatchRefreshEvent = (eventName: string) => {
  // Create and dispatch a custom event
  try {
    // List of supported event types for documentation
    const supportedEvents = [
      'event-submitted',        // When an event is created or updated
      'event-deleted',          // When an event is deleted
      'event-updated',          // When an event details are modified
      'event-rsvp-updated',     // When an RSVP is added or removed
      'profile-updated',        // When a user profile is updated
      'activities-updated',     // When activities need to be refreshed
      'skills-updated',         // When skills need to be refreshed
      'safety-updated',         // When safety updates need to be refreshed
      'goods-updated'           // When goods exchange items need to be refreshed
    ];
    
    // Create and dispatch the event
    console.log(`[refreshEvents] Dispatching refresh event: ${eventName}`);
    const event = new CustomEvent(eventName);
    window.dispatchEvent(event);
  } catch (error) {
    console.error(`[refreshEvents] Error dispatching ${eventName} event:`, error);
  }
};
