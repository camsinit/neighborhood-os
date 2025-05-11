
/**
 * This event utility helps components across the app stay in sync
 * without needing to directly import or depend on each other
 */
import { createLogger } from '@/utils/logger';

// Create a dedicated logger for refresh events
const logger = createLogger('refreshEvents');

// Create a custom event system for refreshes
type EventType = 'activities-updated' | 'event-rsvp-updated' | 'event-submitted' | 
                'safety-updated' | 'goods-updated' | 'skills-updated' | 
                'event-deleted'; // Added event-deleted type

// Create a simple event emitter for our refresh events
const eventEmitter = {
  events: {} as Record<string, Array<() => void>>,
  
  // Subscribe to an event
  on(event: string, callback: () => void) {
    if (!this.events[event]) {
      this.events[event] = [];
      logger.trace(`Created new event bucket for: ${event}`);
    }
    
    this.events[event].push(callback);
    logger.trace(`Added listener to ${event}, total listeners: ${this.events[event].length}`);
    
    // Return unsubscribe function
    return () => {
      logger.trace(`Unsubscribe called for event: ${event}`);
      this.events[event] = this.events[event].filter(cb => cb !== callback);
      logger.trace(`After unsubscribe, ${event} has ${this.events[event].length} listeners remaining`);
    };
  },
  
  // Emit an event
  emit(event: string) {
    logger.trace(`Attempting to emit event: ${event}`);
    
    if (this.events[event]) {
      logger.debug(`Emitting event: ${event} to ${this.events[event].length} listeners`);
      this.events[event].forEach((callback, index) => {
        logger.trace(`Calling listener #${index + 1} for event: ${event}`);
        try {
          callback();
        } catch (error) {
          logger.error(`Error in listener #${index + 1} for event ${event}:`, error);
        }
      });
      logger.trace(`Finished emitting event: ${event}`);
    } else {
      logger.trace(`No listeners registered for event: ${event}`);
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
  
  // Then, also emit the general activities update event to refresh the activity feed
  if (eventType !== 'activities-updated') {
    logger.trace(`Auto-dispatching activities-updated because ${eventType} was triggered`);
    eventEmitter.emit('activities-updated');
  }
  
  logger.info(`Completed dispatch for event: ${eventType}`);
};

// Shorthand methods for common module refreshes
export const refreshEvents = {
  // General activity feed updates
  activities: () => {
    logger.debug('Refreshing activities via shorthand method');
    eventEmitter.emit('activities-updated');
  },
  
  // Module-specific refreshes
  events: () => {
    logger.debug('Refreshing events via shorthand method');
    eventEmitter.emit('event-submitted');
  },
  eventsDelete: () => {
    logger.debug('Refreshing events deletion via shorthand method');
    eventEmitter.emit('event-deleted');
  },
  safety: () => {
    logger.debug('Refreshing safety via shorthand method');
    eventEmitter.emit('safety-updated');
  },
  goods: () => {
    logger.debug('Refreshing goods via shorthand method');
    eventEmitter.emit('goods-updated');
  },
  skills: () => {
    logger.debug('Refreshing skills via shorthand method');
    eventEmitter.emit('skills-updated');
  },
  
  // Add the core emitters for custom events
  on: eventEmitter.on.bind(eventEmitter),
  emit: eventEmitter.emit.bind(eventEmitter),
};
