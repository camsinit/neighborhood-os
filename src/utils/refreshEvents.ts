
/**
 * This file contains utilities for dispatching refresh events
 * across the application. These events are used to trigger refetching
 * of data in components that display dynamic content.
 */

// Use a debounce mechanism to prevent multiple dispatches in rapid succession
const recentEvents: Record<string, number> = {};
const DEBOUNCE_TIME = 300; // ms

/**
 * Dispatches a custom event to trigger a refresh of various components
 * 
 * FIXED: Now includes debouncing to prevent duplicate events being dispatched
 * 
 * @param eventName - The name of the refresh event
 */
export const dispatchRefreshEvent = (eventName: string) => {
  // Check if this event was recently dispatched to prevent duplicates
  const now = Date.now();
  if (recentEvents[eventName] && now - recentEvents[eventName] < DEBOUNCE_TIME) {
    console.log(`[refreshEvents] Skipping duplicate event dispatch: ${eventName}`);
    return;
  }
  
  // Remember when we dispatched this event
  recentEvents[eventName] = now;
  
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

/**
 * Helper object with named methods for refreshing different parts of the application
 * 
 * This object is used by various components throughout the application
 * to trigger data refreshes in other components.
 */
export const refreshEvents = {
  // Event-related refresh methods
  eventsUpdate: () => dispatchRefreshEvent('event-updated'),
  eventsDelete: () => dispatchRefreshEvent('event-deleted'),
  eventsSubmit: () => dispatchRefreshEvent('event-submitted'),
  rsvpUpdate: () => dispatchRefreshEvent('event-rsvp-updated'),
  
  // Other module refresh methods
  profile: () => dispatchRefreshEvent('profile-updated'),
  activities: () => dispatchRefreshEvent('activities-updated'),
  skills: () => dispatchRefreshEvent('skills-updated'),
  safety: () => dispatchRefreshEvent('safety-updated'),
  goods: () => dispatchRefreshEvent('goods-updated'),
};
