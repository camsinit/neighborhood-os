
/**
 * Refresh Events Utility
 * 
 * This utility provides a centralized way to trigger UI refreshes
 * after data changes. It uses the observer pattern for maximum compatibility.
 * 
 * Event Flow:
 * 1. Components subscribe to specific event types using the "on" method
 * 2. When data changes occur, services emit events with the "emit" method
 * 3. All components subscribed to that event type receive a notification
 * 4. Components can respond by refreshing their data or updating their state
 * 5. Components clean up subscriptions when unmounting using the returned function
 */
import { createLogger } from '@/utils/logger';

// Create a dedicated logger for this utility
const logger = createLogger('refreshEvents');

/**
 * Define supported event types
 * This ensures type safety when subscribing to or emitting events
 */
export type EventType = 
  // Core module events
  'events' | 
  'safety' | 
  'goods' | 
  'skills' | 
  'notifications' | 
  'activities' | 
  
  // Notification-specific events
  'notification-created' |
  'notification-read' |     
  'notification-archived' | 
  'notifications-all-read' |
  
  // Event-specific events 
  'event-rsvp-updated' | 
  'event-submitted' | 
  'event-updated' |
  'event-deleted' |
  
  // Module update events
  'skills-updated' |
  'safety-updated' |
  'goods-updated' |
  'activities-updated' |
  
  // Content update events
  'safety-update-submitted' |
  'profile-updated' |
  
  // Skill notification events
  'skill-request-created' |
  'skill-session-confirmed' |
  'skill-session-cancelled' |
  'skill-session-rescheduled' |
  'skill-completed';

/**
 * Observer map - stores callbacks for each event type
 * The key is the event type and the value is an array of callback functions
 */
const observers: { [key in string]?: (() => void)[] } = {};

/**
 * Subscribe to a refresh event
 * 
 * Use this method to listen for specific events in your components.
 * It returns an unsubscribe function that should be called during cleanup.
 * 
 * Example usage in a React component:
 * ```
 * useEffect(() => {
 *   // Subscribe to notifications updates
 *   const unsubscribe = refreshEvents.on('notifications', () => {
 *     // Refresh data when notifications change
 *     refetchNotifications();
 *   });
 *   
 *   // Clean up subscription when component unmounts
 *   return unsubscribe;
 * }, [refetchNotifications]);
 * ```
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
 * This method is typically not called directly. Instead, use the
 * function returned by the "on" method to unsubscribe.
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
 * Use this method to notify all subscribed components that data has changed.
 * This will trigger all callbacks registered for the specified event type.
 * 
 * Example usage:
 * ```
 * // After creating a new notification
 * await createNotification(params);
 * refreshEvents.emit('notification-created');
 * ```
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
