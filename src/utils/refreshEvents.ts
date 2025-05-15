/**
 * Refresh Events Utility
 * 
 * This utility provides a centralized way to trigger UI refreshes
 * after data changes. It uses both a simple observer pattern and
 * DOM events for maximum compatibility.
 */
import { createLogger } from '@/utils/logger';

// Create a dedicated logger for this utility
const logger = createLogger('refreshEvents');

// Define event types
type EventType = 'events' | 'safety' | 'goods' | 'skills' | 'notifications' | 'activities';

// Observer list for each event type
const observers: { [key in EventType]?: (() => void)[] } = {};

/**
 * Subscribe to a refresh event
 * 
 * @param eventType The type of event to subscribe to
 * @param callback The function to call when the event is triggered
 * @returns A function to unsubscribe
 */
const on = (eventType: EventType, callback: () => void): (() => void) => {
  if (!observers[eventType]) {
    observers[eventType] = [];
  }
  observers[eventType]?.push(callback);

  return () => {
    observers[eventType] = observers[eventType]?.filter(observer => observer !== callback);
  };
};

/**
 * Trigger a refresh event
 * 
 * @param eventType The type of event to trigger
 */
const trigger = (eventType: EventType) => {
  logger.debug(`Triggering refresh event: ${eventType}`);
  observers[eventType]?.forEach(callback => callback());
};

/**
 * Dispatches a refresh event of a specific type 
 * This is used to centralize event emission for refreshes
 * 
 * @param eventName The name of the event to dispatch
 */
export const dispatchRefreshEvent = (eventName: string) => {
  // Dispatch a DOM event that components can listen for
  window.dispatchEvent(new CustomEvent(eventName));
  
  // Also use the observer pattern if an event handler exists
  const eventType = eventName.split('-')[0]; // Extract base type (e.g., 'notification' from 'notification-created')
  
  if (eventType && refreshEvents[eventType as keyof typeof refreshEvents]) {
    // Call the appropriate refresh function
    (refreshEvents[eventType as keyof typeof refreshEvents] as Function)();
  }
};

// Export individual trigger functions for each event type
export const refreshEvents = {
  on,
  events: () => trigger('events'),
  safety: () => trigger('safety'),
  goods: () => trigger('goods'),
  skills: () => trigger('skills'),
  notifications: () => trigger('notifications'),
  activities: () => trigger('activities')
};

export default refreshEvents;
