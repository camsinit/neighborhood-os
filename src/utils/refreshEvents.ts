
/**
 * This event utility helps components across the app stay in sync
 * without needing to directly import or depend on each other
 */

// Create a custom event system for refreshes
type EventType = 'activities-updated' | 'event-rsvp-updated' | 'event-submitted' | 
                'safety-updated' | 'goods-updated' | 'skills-updated';

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

// Shorthand methods for common module refreshes
export const refreshEvents = {
  // General activity feed updates
  activities: () => eventEmitter.emit('activities-updated'),
  
  // Module-specific refreshes
  events: () => eventEmitter.emit('event-submitted'),
  safety: () => eventEmitter.emit('safety-updated'),
  goods: () => eventEmitter.emit('goods-updated'),
  skills: () => eventEmitter.emit('skills-updated'),
  
  // Add the core emitters for custom events
  on: eventEmitter.on.bind(eventEmitter),
  emit: eventEmitter.emit.bind(eventEmitter),
};
