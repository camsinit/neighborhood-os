
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

/**
 * Dispatch a generic refresh event
 * Components can listen for these events to refresh their data
 * 
 * @param type The type of event to refresh
 */
export function dispatchRefreshEvent(type: RefreshEventType | string): void {
  logger.debug(`Dispatching refresh event: ${type}`);
  window.dispatchEvent(new CustomEvent(type));
}

/**
 * Refresh notifications data
 * Triggers UI components to refetch notification data
 */
function refreshNotifications(): void {
  logger.debug('Refreshing notifications');
  dispatchRefreshEvent('notifications');
}

/**
 * Refresh activity feed data
 * Triggers UI components to refetch activity data
 */
function refreshActivities(): void {
  logger.debug('Refreshing activities');
  dispatchRefreshEvent('activities');
}

/**
 * Refresh events data
 * Triggers UI components to refetch event data
 */
function refreshEvents(): void {
  logger.debug('Refreshing events');
  dispatchRefreshEvent('events');
}

/**
 * Refresh skills data
 * Triggers UI components to refetch skills data
 */
function refreshSkills(): void {
  logger.debug('Refreshing skills');
  dispatchRefreshEvent('skills');
}

/**
 * Refresh goods exchange data
 * Triggers UI components to refetch goods exchange data
 */
function refreshGoods(): void {
  logger.debug('Refreshing goods exchange');
  dispatchRefreshEvent('goods');
}

/**
 * Refresh safety updates data
 * Triggers UI components to refetch safety updates
 */
function refreshSafety(): void {
  logger.debug('Refreshing safety');
  dispatchRefreshEvent('safety');
}

/**
 * Subscribe to a refresh event
 * 
 * @param type The event type to listen for
 * @param callback The function to call when the event occurs
 * @returns A function to unsubscribe from the event
 */
function on(type: RefreshEventType | string, callback: EventListener): () => void {
  logger.debug(`Adding listener for ${type}`);
  window.addEventListener(type, callback);
  
  // Return unsubscribe function
  return () => {
    logger.debug(`Removing listener for ${type}`);
    window.removeEventListener(type, callback);
  };
}

// Export the refreshEvents object with all methods
const refreshEvents = {
  notifications: refreshNotifications,
  activities: refreshActivities,
  events: refreshEvents,
  skills: refreshSkills,
  goods: refreshGoods,
  safety: refreshSafety,
  on // Add the 'on' method
};

export { refreshEvents };
export default refreshEvents;
