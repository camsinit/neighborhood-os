
/**
 * Unified Event System
 * 
 * Consolidates refreshEvents, databaseEventEmitter, and useAutoRefresh
 * into a single, efficient event system
 */

// Supported event types
export type UnifiedEventType = 
  'activities' | 
  'notifications' | 
  'events' | 
  'safety' | 
  'goods' | 
  'skills' | 
  'neighbors';

// Event observer storage
const observers = new Map<UnifiedEventType, Set<() => void>>();

/**
 * Subscribe to events
 */
export const subscribe = (eventType: UnifiedEventType, callback: () => void): (() => void) => {
  if (!observers.has(eventType)) {
    observers.set(eventType, new Set());
  }
  
  observers.get(eventType)!.add(callback);
  
  // Return unsubscribe function
  return () => {
    observers.get(eventType)?.delete(callback);
  };
};

/**
 * Emit events
 */
export const emit = (eventType: UnifiedEventType, data?: any): void => {
  const callbacks = observers.get(eventType);
  if (callbacks) {
    callbacks.forEach(callback => callback());
  }
};

/**
 * Emit multiple related events at once
 */
export const emitMultiple = (eventTypes: UnifiedEventType[]): void => {
  eventTypes.forEach(eventType => emit(eventType));
};

/**
 * Database operation event emitter
 * Replaces the complex databaseEventEmitter
 */
export const emitDatabaseChange = (
  operation: 'create' | 'update' | 'delete',
  contentType: 'event' | 'safety' | 'goods' | 'skills' | 'notification' | 'neighbor'
): void => {
  // Map content types to event types
  const eventTypeMap: Record<string, UnifiedEventType[]> = {
    'event': ['events', 'activities'],
    'safety': ['safety', 'activities'],
    'goods': ['goods', 'activities'],
    'skills': ['skills', 'activities'],
    'notification': ['notifications'],
    'neighbor': ['neighbors', 'activities', 'notifications']
  };
  
  const eventsToEmit = eventTypeMap[contentType] || [];
  emitMultiple(eventsToEmit);
};

// Export the unified system
export const unifiedEvents = {
  subscribe,
  emit,
  emitMultiple,
  emitDatabaseChange
};

export default unifiedEvents;
