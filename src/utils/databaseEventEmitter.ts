
/**
 * Database Event Emitter
 * 
 * This utility helps bridge database operations with the UI refresh system
 * When database changes occur, it emits events that components can listen for
 */
import { createLogger } from '@/utils/logger';
import { refreshEvents } from './refreshEvents';

// Create a dedicated logger
const logger = createLogger('databaseEventEmitter');

/**
 * Helper function to emit events after a successful database operation
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
 * This can be called after any operation that might generate notifications
 */
export const refreshNotifications = () => {
  logger.debug('Refreshing notifications');
  refreshEvents.emit('notifications');
};

/**
 * Helper to trigger activity feed refresh
 * This can be called after any operation that might generate activities
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
