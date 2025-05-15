
/**
 * RefreshEvents - Utility for refreshing data across components
 * 
 * This utility helps components communicate when data needs to be refreshed
 * without tight coupling, using a custom events system.
 */

// Define refresh event types
export type RefreshEventType = 
  | 'events'
  | 'safety'
  | 'goods'
  | 'skills'
  | 'notifications'
  | 'activities';

// Specific event action types
export type EventActionType = 
  | 'event-submitted'
  | 'event-deleted'
  | 'event-updated'
  | 'event-rsvp-updated'
  | 'safety-updated'
  | 'goods-updated'
  | 'skills-updated'
  | 'notifications-read'
  | 'activities-updated';

/**
 * Dispatch a custom event to notify components that data needs to be refreshed
 * 
 * @param eventType The type of refresh event
 * @param data Optional data to include with the event
 */
export const dispatchRefreshEvent = (eventType: EventActionType, data?: any): void => {
  const event = new CustomEvent(eventType, { detail: data });
  window.dispatchEvent(event);
};

/**
 * Subscribe to a refresh event
 * 
 * @param eventType The type of refresh event to listen for
 * @param callback The function to call when the event is fired
 * @returns A function to unsubscribe from the event
 */
export const subscribeToRefreshEvent = (eventType: EventActionType, callback: (data?: any) => void): () => void => {
  // Create an event listener that calls the callback with the event detail
  const eventListener = (event: Event) => {
    const customEvent = event as CustomEvent;
    callback(customEvent.detail);
  };
  
  // Add the event listener to the window object
  window.addEventListener(eventType, eventListener);
  
  // Return a function that removes the event listener
  return () => {
    window.removeEventListener(eventType, eventListener);
  };
};

/**
 * Individual refresh functions per data type
 * These simplify calling the generic dispatchRefreshEvent with the correct event type
 */
export const refreshEvents = {
  // Event refreshes
  events: (data?: any) => {
    dispatchRefreshEvent('event-submitted', data);
  },

  // Safety updates refreshes
  safety: (data?: any) => {
    dispatchRefreshEvent('safety-updated', data);
  },

  // Goods updates refreshes
  goods: (data?: any) => {
    dispatchRefreshEvent('goods-updated', data);
  },

  // Skills updates refreshes
  skills: (data?: any) => {
    dispatchRefreshEvent('skills-updated', data);
  },

  // Notifications updates refreshes
  notifications: (data?: any) => {
    dispatchRefreshEvent('notifications-read', data);
  },

  // Activities updates refreshes
  activities: (data?: any) => {
    dispatchRefreshEvent('activities-updated', data);
  },

  // Add an 'on' method to subscribe to refresh events
  on: (eventType: EventActionType, callback: (data?: any) => void): () => void => {
    return subscribeToRefreshEvent(eventType, callback);
  }
};

// Default export for simpler imports
export default refreshEvents;
