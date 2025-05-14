
/**
 * Enhanced event utility helps components across the app stay in sync
 * without needing to directly import or depend on each other
 * 
 * Now with improved logging and event handling
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
    logger.debug(`Added listener for event: ${event}, total listeners: ${this.events[event].length}`);
    
    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
      logger.debug(`Removed listener for event: ${event}, remaining listeners: ${this.events[event]?.length || 0}`);
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
    } else {
      logger.warn(`Attempted to emit event: ${event} but no listeners are registered`);
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
  const timestamp = new Date().toISOString();
  logger.debug(`Dispatching event: ${eventType} at ${timestamp}`);
  
  // First, emit the specific event through eventEmitter
  eventEmitter.emit(eventType);
  
  // Also dispatch a DOM event for components using useEffect listeners
  const event = new CustomEvent(eventType, { 
    detail: { timestamp }
  });
  window.dispatchEvent(event);
  
  logger.debug(`Finished dispatching ${eventType}`);
};

/**
 * Enhanced refresh events helper with better logging
 * This provides shorthand methods for common refresh events
 */
export const refreshEvents = {
  /**
   * Refresh the activities feed
   */
  activities: () => {
    logger.debug('Triggering activities refresh');
    dispatchRefreshEvent('activities-updated');
  },
  
  /**
   * Refresh events after an event action
   */
  events: () => {
    logger.debug('Triggering events refresh');
    dispatchRefreshEvent('event-submitted');
  },
  
  /**
   * Refresh events after an event is deleted
   */
  eventsDelete: () => {
    logger.debug('Triggering events delete refresh');
    dispatchRefreshEvent('event-deleted');
  },
  
  /**
   * Refresh safety updates
   */
  safety: () => {
    logger.debug('Triggering safety refresh');
    dispatchRefreshEvent('safety-updated');
  },
  
  /**
   * Refresh goods items
   */
  goods: () => {
    logger.debug('Triggering goods refresh');
    dispatchRefreshEvent('goods-updated');
  },
  
  /**
   * Refresh skills items
   */
  skills: () => {
    logger.debug('Triggering skills refresh');
    dispatchRefreshEvent('skills-updated');
  },
  
  /**
   * Refresh notifications
   * This is a critical event for notification visibility
   */
  notifications: () => {
    logger.debug('Triggering notifications refresh');
    // Dispatch the notification event
    dispatchRefreshEvent('notification-created');
    
    // Also manually invalidate React Query cache for notifications
    // This needs to be handled by components listening to this event
    logger.debug('Notifications refresh event dispatched');
  },
  
  // Add the core emitters for custom events
  on: eventEmitter.on.bind(eventEmitter),
  emit: eventEmitter.emit.bind(eventEmitter),
};

export default refreshEvents;
