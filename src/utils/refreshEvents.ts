
/**
 * Unified Event Refresh Utility
 * 
 * This utility provides standardized methods to refresh various parts of the UI
 * after data changes, particularly for notifications and activity feeds.
 */
import { createLogger } from './logger';

// Create a dedicated logger
const logger = createLogger('refreshEvents');

// Define the event types that can be refreshed
export type RefreshEventType = 
  | 'notifications' 
  | 'activities' 
  | 'events' 
  | 'skills' 
  | 'goods' 
  | 'safety' 
  | 'support' 
  | 'neighbors';

// Define DOM event names that can be used
export type EventActionType =
  | 'notifications-read'
  | 'notifications-created'
  | 'events-updated'
  | 'skills-updated'
  | 'goods-updated'
  | 'safety-updated'
  | 'activities-updated';

/**
 * Dispatch a generic refresh event
 * Components can listen for these events to refresh their data
 * 
 * @param type The type of event to refresh
 * @param data Optional data to pass with the event
 */
export function dispatchRefreshEvent(type: RefreshEventType | EventActionType, data?: any): void {
  logger.debug(`Dispatching refresh event: ${type}`);
  window.dispatchEvent(new CustomEvent(type, { detail: data }));
}

// Event handlers registry
const eventHandlers: Record<string, Array<(data?: any) => void>> = {};

/**
 * Register an event handler
 * 
 * @param event The event to listen for
 * @param handler The handler function to call
 * @returns A function to unsubscribe the handler
 */
function on(event: RefreshEventType | EventActionType, handler: (data?: any) => void): () => void {
  if (!eventHandlers[event]) {
    eventHandlers[event] = [];
  }
  
  eventHandlers[event].push(handler);
  
  return () => {
    const index = eventHandlers[event].indexOf(handler);
    if (index !== -1) {
      eventHandlers[event].splice(index, 1);
    }
  };
}

/**
 * Refresh notifications data
 * Triggers UI components to refetch notification data
 */
function refreshNotifications(data?: any): void {
  logger.debug('Refreshing notifications');
  dispatchRefreshEvent('notifications', data);
}

/**
 * Refresh activity feed data
 * Triggers UI components to refetch activity data
 */
function refreshActivities(data?: any): void {
  logger.debug('Refreshing activities');
  dispatchRefreshEvent('activities', data);
}

/**
 * Refresh events data
 * Triggers UI components to refetch event data
 */
function refreshEvents(data?: any): void {
  logger.debug('Refreshing events');
  dispatchRefreshEvent('events', data);
}

/**
 * Refresh skills data
 * Triggers UI components to refetch skills data
 */
function refreshSkills(data?: any): void {
  logger.debug('Refreshing skills');
  dispatchRefreshEvent('skills', data);
}

/**
 * Refresh goods exchange data
 * Triggers UI components to refetch goods exchange data
 */
function refreshGoods(data?: any): void {
  logger.debug('Refreshing goods exchange');
  dispatchRefreshEvent('goods', data);
}

/**
 * Refresh safety updates data
 * Triggers UI components to refetch safety updates
 */
function refreshSafety(data?: any): void {
  logger.debug('Refreshing safety updates');
  dispatchRefreshEvent('safety', data);
}

// Export all refresh functions
const refreshEvents = {
  notifications: refreshNotifications,
  activities: refreshActivities,
  events: refreshEvents,
  skills: refreshSkills,
  goods: refreshGoods,
  safety: refreshSafety,
  on // Add the on method to subscribe to events
};

export default refreshEvents;
