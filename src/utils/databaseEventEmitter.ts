
/**
 * Database Event Emitter
 * 
 * This utility helps bridge database operations with the UI refresh system
 * When database changes occur, it emits events that components can listen for
 * 
 * ENHANCED: Added specific support for neighbor join events and improved goods support
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
  contentType: 'event' | 'safety' | 'goods' | 'skills' | 'notification' | 'activity' | 'neighbor'
) => {
  logger.debug(`Emitting database event: ${operation} ${contentType}`);
  
  // Map content types to event types
  const eventMap: Record<string, keyof typeof refreshEvents> = {
    'event': 'events',
    'safety': 'safety',
    'goods': 'goods',
    'skills': 'skills',
    'notification': 'notifications',
    'activity': 'activities',
    'neighbor': 'neighbors'
  };
  
  // Get the corresponding event emitter function
  const eventEmitter = eventMap[contentType];
  
  if (eventEmitter) {
    // Emit the event using the new emit method
    refreshEvents.emit(eventEmitter as any);
    
    // For neighbor events, also emit activities update since neighbor joins create activities
    if (contentType === 'neighbor' && operation === 'create') {
      logger.debug('Neighbor join detected - also refreshing activities');
      refreshEvents.emit('activities');
    }
    
    // For goods events, also emit activities update since goods creation creates activities
    if (contentType === 'goods' && operation === 'create') {
      logger.debug('Goods creation detected - also refreshing activities');
      refreshEvents.emit('activities');
    }
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

/**
 * Helper specifically for neighbor join events
 * This ensures both the neighbor list and activity feed are updated
 */
export const emitNeighborJoinEvent = (userId: string) => {
  logger.debug(`Emitting neighbor join event for user: ${userId}`);
  
  // Refresh the neighbors list
  refreshEvents.emit('neighbors');
  
  // Refresh activities since neighbor joins create activity entries
  refreshEvents.emit('activities');
  
  // Also refresh notifications since neighbor joins create notifications
  refreshEvents.emit('notifications');
};

/**
 * NEW: Helper specifically for goods creation events
 * This ensures both the goods list and activity feed are updated
 */
export const emitGoodsCreationEvent = (itemId: string) => {
  logger.debug(`Emitting goods creation event for item: ${itemId}`);
  
  // Refresh the goods list
  refreshEvents.emit('goods');
  
  // Refresh activities since goods creation creates activity entries
  refreshEvents.emit('activities');
};

export default {
  emitDatabaseEvent,
  refreshNotifications,
  refreshActivities,
  emitNeighborJoinEvent,
  emitGoodsCreationEvent
};
