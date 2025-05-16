
/**
 * Database Event Emitter
 * 
 * This utility helps bridge database operations with the UI refresh system.
 * When database changes occur, it emits events that components can listen for.
 * 
 * Event Flow:
 * 1. Database operation occurs (create, update, delete)
 * 2. This utility emits the appropriate event
 * 3. Components that subscribed to that event are notified
 * 4. Components refresh their data as needed
 * 
 * Integration with UI Components:
 * - Components use the refreshEvents.on() method to subscribe to events
 * - After database operations, call these helper functions to emit events
 * - This creates a decoupled system where DB operations don't need to know
 *   which components are listening
 */
import { createLogger } from '@/utils/logger';
import { refreshEvents } from './refreshEvents';

// Create a dedicated logger
const logger = createLogger('databaseEventEmitter');

/**
 * Helper function to emit events after a successful database operation
 * 
 * Use this function after performing database operations to notify
 * components that data has changed. This helps keep the UI in sync
 * with the database state.
 * 
 * Example:
 * ```
 * // After creating a new event
 * const { data, error } = await supabase.from('events').insert([newEvent]);
 * if (!error) {
 *   emitDatabaseEvent('create', 'event');
 * }
 * ```
 * 
 * @param operation - The database operation performed (create, update, delete)
 * @param contentType - The type of content affected
 */
export const emitDatabaseEvent = (
  operation: 'create' | 'update' | 'delete',
  contentType: 'event' | 'safety' | 'goods' | 'skills' | 'notification' | 'activity'
) => {
  logger.debug(`Emitting database event: ${operation} ${contentType}`);
  
  // Map content types to event types
  const eventMap: Record<string, keyof typeof refreshEvents> = {
    'event': 'events',
    'safety': 'safety',
    'goods': 'goods',
    'skills': 'skills',
    'notification': 'notifications',
    'activity': 'activities'
  };
  
  // Get the corresponding event emitter function
  const eventEmitter = eventMap[contentType];
  
  if (eventEmitter) {
    // Emit the event using the new emit method
    refreshEvents.emit(eventEmitter as any);
  } else {
    logger.warn(`No event emitter found for content type: ${contentType}`);
  }
};

/**
 * Helper to trigger notification refresh
 * 
 * This is a specialized helper that can be called after any operation
 * that might generate notifications, such as creating an event that
 * will trigger notification creation via database triggers.
 */
export const refreshNotifications = () => {
  logger.debug('Refreshing notifications');
  refreshEvents.emit('notifications');
};

/**
 * Helper to trigger activity feed refresh
 * 
 * Similar to refreshNotifications, but for the activity feed.
 */
export const refreshActivities = () => {
  logger.debug('Refreshing activities');
  refreshEvents.emit('activities');
};

export default {
  emitDatabaseEvent,
  refreshNotifications,
  refreshActivities
};
