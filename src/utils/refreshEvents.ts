
/**
 * Central utility for managing event-driven refresh operations
 * This helps components stay in sync without tight coupling
 */

// Create a type for event types
type RefreshEventType = 
  | 'events'
  | 'safety'
  | 'goods'
  | 'skills'
  | 'notifications'
  | 'activities'
  | 'event-rsvp';

// In-memory event bus for pub/sub communication
class RefreshEventBus {
  private subscribers: Record<RefreshEventType, Array<() => void>> = {
    events: [],
    safety: [],
    goods: [],
    skills: [],
    notifications: [],
    activities: [],
    'event-rsvp': [], // Add specific event for RSVPs
  };

  // Subscribe to a specific event type
  public on(eventType: RefreshEventType, callback: () => void) {
    if (!this.subscribers[eventType]) {
      this.subscribers[eventType] = [];
    }
    
    this.subscribers[eventType].push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers[eventType].indexOf(callback);
      if (index !== -1) {
        this.subscribers[eventType].splice(index, 1);
      }
    };
  }

  // Trigger all subscribers for an event type
  public emit(eventType: RefreshEventType) {
    console.log(`[RefreshEvents] Emitting ${eventType} refresh event`);
    
    // First, trigger specific event subscribers
    if (this.subscribers[eventType]) {
      this.subscribers[eventType].forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error(`[RefreshEvents] Error in ${eventType} subscriber:`, error);
        }
      });
    }
    
    // Also trigger notifications subscribers for certain events
    if (eventType !== 'notifications' && 
        (eventType === 'events' || eventType === 'event-rsvp')) {
      console.log('[RefreshEvents] Also refreshing notifications');
      this.emit('notifications');
    }
    
    // Dispatch DOM event for components that use event listeners
    window.dispatchEvent(new CustomEvent(`${eventType}-updated`));
  }

  // Convenience methods for common refresh operations
  public events() {
    this.emit('events');
  }
  
  public safety() {
    this.emit('safety');
  }
  
  public goods() {
    this.emit('goods');
  }
  
  public skills() {
    this.emit('skills');
  }
  
  public notifications() {
    this.emit('notifications');
  }
  
  public activities() {
    this.emit('activities');
  }
  
  public eventRsvp() {
    this.emit('event-rsvp');
  }
}

// Create and export a singleton instance
export const refreshEvents = new RefreshEventBus();

// Helper to dispatch refresh events from anywhere
export const dispatchRefreshEvent = (type: RefreshEventType) => {
  refreshEvents.emit(type);
};

export default refreshEvents;
