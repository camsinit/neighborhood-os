
/**
 * This event utility helps components across the app stay in sync
 * without needing to directly import or depend on each other
 * 
 * Enhanced with better debugging and reliability
 */
import { createLogger } from '@/utils/logger';

// Create a dedicated logger for refresh events
const logger = createLogger('refreshEvents');

// Define all possible event types in one place for consistency
export type EventType = 'activities-updated' | 
                'event-rsvp-updated' | 'event-submitted' | 'event-deleted' |
                'safety-updated' | 
                'goods-updated' | 
                'skills-updated' | 
                'notification-created';

// Define the callback type for events
type EventCallback = () => void;

// Create a simple event emitter for our refresh events with enhanced logging
const eventEmitter = {
  events: {} as Record<string, Array<EventCallback>>,
  eventIds: {} as Record<string, number>,
  
  // Subscribe to an event
  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
      this.eventIds[event] = 0;
      logger.debug(`Created new event bucket for: ${event}`);
    }
    
    // Increment counter to assign a unique ID to this listener
    this.eventIds[event]++;
    const listenerId = this.eventIds[event];
    
    this.events[event].push(callback);
    logger.debug(`Added listener #${listenerId} to ${event}, total listeners: ${this.events[event].length}`);
    
    // Return unsubscribe function
    return () => {
      logger.debug(`Unsubscribe called for event: ${event}, listener #${listenerId}`);
      this.events[event] = this.events[event].filter(cb => cb !== callback);
      logger.debug(`After unsubscribe, ${event} has ${this.events[event].length} listeners remaining`);
    };
  },
  
  // Emit an event
  emit(event: string, data?: any): number {
    logger.debug(`Attempting to emit event: ${event}`);
    
    if (this.events[event]) {
      const listenerCount = this.events[event].length;
      logger.info(`Emitting event: ${event} to ${listenerCount} listeners`);
      
      this.events[event].forEach((callback, index) => {
        logger.debug(`Calling listener #${index + 1} for event: ${event}`);
        try {
          callback();
        } catch (error) {
          logger.error(`Error in listener #${index + 1} for event ${event}:`, error);
        }
      });
      logger.debug(`Finished emitting event: ${event}`);
      
      return listenerCount; // Return number of listeners notified
    } else {
      logger.debug(`No listeners registered for event: ${event}`);
      return 0;
    }
  },
  
  // List all registered events and their listener counts
  getRegisteredEvents() {
    const events: Record<string, number> = {};
    for (const [eventName, listeners] of Object.entries(this.events)) {
      events[eventName] = listeners.length;
    }
    return events;
  }
};

/**
 * Helper function to dispatch refresh events
 * This provides a consistent interface for triggering events across the app
 * 
 * @param eventType - The type of event to dispatch
 * @param data - Optional data to include with the event
 */
export const dispatchRefreshEvent = (eventType: EventType, data?: any) => {
  logger.info(`Dispatching event: ${eventType}`);
  
  // First, emit the specific event using our utility
  const listenersNotified = eventEmitter.emit(eventType, data);
  logger.debug(`Notified ${listenersNotified} listeners via eventEmitter`);
  
  // Also dispatch a DOM event for components using useEffect listeners
  const customEvent = data 
    ? new CustomEvent(eventType, { detail: data })
    : new CustomEvent(eventType);
    
  window.dispatchEvent(customEvent);
  logger.debug(`Dispatched ${eventType} as DOM event`);
  
  // Automatic cascade events
  
  // Then, also emit the general activities update event to refresh the activity feed
  if (eventType !== 'activities-updated') {
    logger.debug(`Auto-dispatching activities-updated because ${eventType} was triggered`);
    eventEmitter.emit('activities-updated');
  }
  
  // For events that should update notifications
  if (['event-rsvp-updated', 'event-submitted', 'skills-updated'].includes(eventType) &&
      eventType !== 'notification-created') {
    logger.debug(`Auto-dispatching notification-created because ${eventType} was triggered`);
    eventEmitter.emit('notification-created');
  }
  
  logger.info(`Completed dispatch for event: ${eventType}`);
};

// Shorthand methods for common module refreshes
export const refreshEvents = {
  // General activity feed updates
  activities: () => {
    logger.debug('Refreshing activities via shorthand method');
    dispatchRefreshEvent('activities-updated');
  },
  
  // Module-specific refreshes
  events: () => {
    logger.debug('Refreshing events via shorthand method');
    dispatchRefreshEvent('event-submitted');
  },
  eventsDelete: () => {
    logger.debug('Refreshing events deletion via shorthand method');
    dispatchRefreshEvent('event-deleted');
  },
  safety: () => {
    logger.debug('Refreshing safety via shorthand method');
    dispatchRefreshEvent('safety-updated');
  },
  goods: () => {
    logger.debug('Refreshing goods via shorthand method');
    dispatchRefreshEvent('goods-updated');
  },
  skills: () => {
    logger.debug('Refreshing skills via shorthand method');
    dispatchRefreshEvent('skills-updated');
  },
  notifications: () => {
    logger.debug('Refreshing notifications via shorthand method');
    dispatchRefreshEvent('notification-created');
  },
  
  // Debug helper to get all registered events
  debug: () => {
    const events = eventEmitter.getRegisteredEvents();
    logger.info('Currently registered events:', events);
    return events;
  },
  
  // Add the core emitters for custom events
  on: eventEmitter.on.bind(eventEmitter),
  emit: eventEmitter.emit.bind(eventEmitter),
};

// Export the refreshEvents as default
export default refreshEvents;
