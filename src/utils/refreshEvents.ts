
/**
 * This event utility helps components across the app stay in sync
 * without needing to directly import or depend on each other
 */

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
    }
    this.events[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  },
  
  // Emit an event
  emit(event: string) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback());
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
  // First, emit the specific event
  eventEmitter.emit(eventType);
  
  // Then, also emit the general activities update event to refresh the activity feed
  if (eventType !== 'activities-updated') {
    eventEmitter.emit('activities-updated');
  }
  
  console.log(`[refreshEvents] Dispatched event: ${eventType}`);
};

// Shorthand methods for common module refreshes
export const refreshEvents = {
  // General activity feed updates
  activities: () => eventEmitter.emit('activities-updated'),
  
  // Module-specific refreshes
  events: () => eventEmitter.emit('event-submitted'),
  eventsDelete: () => eventEmitter.emit('event-deleted'), // Added event deletion method
  safety: () => eventEmitter.emit('safety-updated'),
  goods: () => eventEmitter.emit('goods-updated'),
  skills: () => eventEmitter.emit('skills-updated'),
  
  // Add the core emitters for custom events
  on: eventEmitter.on.bind(eventEmitter),
  emit: eventEmitter.emit.bind(eventEmitter),
};
