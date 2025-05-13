
/**
 * This event utility helps components across the app stay in sync
 * without needing to directly import or depend on each other
 * 
 * Simplified version to support the streamlined notifications system
 */
import { createLogger } from '@/utils/logger';

// Create a dedicated logger for refresh events
const logger = createLogger('refreshEvents');

// Define all possible event types in one place for consistency
type EventType = 'activities-updated' | 
                'event-rsvp-updated' | 'event-submitted' | 'event-deleted' |
                'safety-updated' | 
                'goods-updated' | 
                'skills-updated' | 
                'notification-created';

/**
 * Simple event emitter for our refresh events
 */
const eventEmitter = {
  events: {} as Record<string, Array<() => void>>,
  
  /**
   * Subscribe to an event
   * 
   * @param event - The event to subscribe to
   * @param callback - The callback function to call when the event is emitted
   * @returns An unsubscribe function
   */
  on(event: string, callback: () => void) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  },
  
  /**
   * Emit an event
   * 
   * @param event - The event to emit
   */
  emit(event: string) {
    if (this.events[event]) {
      logger.debug(`Emitting event: ${event} to ${this.events[event].length} listeners`);
      this.events[event].forEach((callback) => {
        try {
          callback();
        } catch (error) {
          logger.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
};

/**
 * Helper function to dispatch refresh events
 * This provides a consistent interface for triggering events across the app
 * 
 * @param eventType - The type of event to dispatch
 */
export const dispatchRefreshEvent = (eventType: EventType) => {
  logger.debug(`Dispatching event: ${eventType}`);
  
  // First, emit the specific event
  eventEmitter.emit(eventType);
  
  // Also dispatch a DOM event for components using useEffect listeners
  window.dispatchEvent(new CustomEvent(eventType));
};

/**
 * Simplified refresh events helper
 * This provides shorthand methods for common refresh events
 */
export const refreshEvents = {
  /**
   * Refresh the activities feed
   */
  activities: () => dispatchRefreshEvent('activities-updated'),
  
  /**
   * Refresh events after an event action
   */
  events: () => dispatchRefreshEvent('event-submitted'),
  
  /**
   * Refresh events after an event is deleted
   */
  eventsDelete: () => dispatchRefreshEvent('event-deleted'),
  
  /**
   * Refresh safety updates
   */
  safety: () => dispatchRefreshEvent('safety-updated'),
  
  /**
   * Refresh goods items
   */
  goods: () => dispatchRefreshEvent('goods-updated'),
  
  /**
   * Refresh skills items
   */
  skills: () => dispatchRefreshEvent('skills-updated'),
  
  /**
   * Refresh notifications
   */
  notifications: () => dispatchRefreshEvent('notification-created'),
  
  // Add the core emitters for custom events
  on: eventEmitter.on.bind(eventEmitter),
  emit: eventEmitter.emit.bind(eventEmitter),
};

export default refreshEvents;
