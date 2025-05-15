
/**
 * Refresh Events Utility
 * 
 * This utility provides a centralized way to trigger UI refreshes
 * after data changes. It uses the observer pattern for maximum compatibility.
 */
import { createLogger } from '@/utils/logger';

// Create a dedicated logger for this utility
const logger = createLogger('refreshEvents');

// Define supported event types
export type EventType = 
  'events' | 
  'safety' | 
  'goods' | 
  'skills' | 
  'notifications' | 
  'activities' | 
  // Custom events
  'notification-created' |
  'notification-read' |     // Added this event type
  'notification-archived' | // Added this event type
  'notifications-all-read' | // Added this event type
  'event-rsvp-updated' | 
  'event-submitted' | 
  'event-updated' |
  'event-deleted' |
  'skills-updated' |
  'safety-updated' |
  'goods-updated' |
  'activities-updated' |
  // Specific content update events
  'safety-update-submitted' |
  'profile-updated' |
  // Skill notification events
  'skill-request-created' |
  'skill-session-confirmed' |
  'skill-session-cancelled' |
  'skill-session-rescheduled' |
  'skill-completed';

// Observer map - stores callbacks for each event type
const observers: { [key in string]?: (() => void)[] } = {};

/**
 * Subscribe to a refresh event
 * 
 * @param eventType The type of event to subscribe to
 * @param callback The function to call when the event is triggered
 * @returns A function to unsubscribe
 */
const on = (eventType: EventType, callback: () => void): (() => void) => {
  logger.debug(`Subscribing to event: ${eventType}`);
  
  if (!observers[eventType]) {
    observers[eventType] = [];
  }
  
  observers[eventType]?.push(callback);

  return () => off(eventType, callback);
};

/**
 * Unsubscribe from a refresh event
 * 
 * @param eventType The type of event to unsubscribe from
 * @param callback The callback to remove
 */
const off = (eventType: EventType, callback: () => void): void => {
  logger.debug(`Unsubscribing from event: ${eventType}`);
  
  if (!observers[eventType]) return;
  
  observers[eventType] = observers[eventType]?.filter(cb => cb !== callback);
};

/**
 * Emit a refresh event
 * 
 * @param eventType The type of event to emit
 * @param data Optional data to pass with the event
 */
const emit = (eventType: EventType, data?: any): void => {
  logger.debug(`Emitting event: ${eventType}`, data ? data : '');
  
  // Notify all observers for this event type
  observers[eventType]?.forEach(callback => callback());
  
  // For backwards compatibility, also dispatch a DOM event
  // This will be deprecated in future versions
  window.dispatchEvent(new CustomEvent(eventType, { detail: data }));
};

// Export the dispatchRefreshEvent for backward compatibility
export const dispatchRefreshEvent = emit;

// Export individual trigger functions for each core event type
export const refreshEvents = {
  on,
  off,
  emit,
  // Legacy methods - these are kept for backwards compatibility
  events: () => emit('events'),
  safety: () => emit('safety'),
  goods: () => emit('goods'),
  skills: () => emit('skills'),
  notifications: () => emit('notifications'),
  activities: () => emit('activities')
};

export default refreshEvents;
