
/**
 * Unified Event System with Migration Layer
 * 
 * Consolidates refreshEvents, databaseEventEmitter, and useAutoRefresh
 * into a single, efficient event system with backward compatibility
 */

// Core supported event types
export type UnifiedEventType = 
  'activities' | 
  'notifications' | 
  'events' | 
  'safety' | 
  'goods' | 
  'skills' | 
  'neighbors';

// Legacy event names that need to be mapped
type LegacyEventType = 
  'event-submitted' |
  'activities-updated' |
  'safety-updated' |
  'notification-created' |
  'goods-updated' |
  'skills-updated' |
  'neighbors-updated';

// All supported event types (core + legacy)
type AllEventTypes = UnifiedEventType | LegacyEventType;

// Mapping from legacy event names to new ones
const eventMapping: Record<LegacyEventType, UnifiedEventType> = {
  'event-submitted': 'events',
  'activities-updated': 'activities',
  'safety-updated': 'safety',
  'notification-created': 'notifications',
  'goods-updated': 'goods',
  'skills-updated': 'skills',
  'neighbors-updated': 'neighbors'
};

// Event observer storage
const observers = new Map<UnifiedEventType, Set<() => void>>();

/**
 * Normalize event type to core type
 */
const normalizeEventType = (eventType: AllEventTypes): UnifiedEventType => {
  return eventMapping[eventType as LegacyEventType] || eventType as UnifiedEventType;
};

/**
 * Subscribe to events
 */
export const subscribe = (eventType: AllEventTypes, callback: () => void): (() => void) => {
  const normalizedType = normalizeEventType(eventType);
  
  if (!observers.has(normalizedType)) {
    observers.set(normalizedType, new Set());
  }
  
  observers.get(normalizedType)!.add(callback);
  
  // Return unsubscribe function
  return () => {
    observers.get(normalizedType)?.delete(callback);
  };
};

/**
 * Emit events
 */
export const emit = (eventType: AllEventTypes, data?: any): void => {
  const normalizedType = normalizeEventType(eventType);
  const callbacks = observers.get(normalizedType);
  if (callbacks) {
    callbacks.forEach(callback => callback());
  }
};

/**
 * Emit multiple related events at once
 */
export const emitMultiple = (eventTypes: AllEventTypes[]): void => {
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

// Legacy method compatibility layer
const legacyMethods = {
  skills: () => emit('skills'),
  activities: () => emit('activities'),
  events: () => emit('events'),
  safety: () => emit('safety'),
  goods: () => emit('goods'),
  notifications: () => emit('notifications'),
  neighbors: () => emit('neighbors'),
  dispatchRefreshEvent: (eventType?: string) => {
    if (eventType) {
      emit(eventType as AllEventTypes);
    } else {
      emit('activities'); // Default fallback
    }
  }
};

// Export the unified system with legacy compatibility
export const unifiedEvents = {
  subscribe,
  emit,
  emitMultiple,
  emitDatabaseChange,
  ...legacyMethods
};

export default unifiedEvents;
