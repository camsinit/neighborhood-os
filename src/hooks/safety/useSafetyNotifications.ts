
/**
 * Hook for safety update notifications
 * 
 * This hook provides utility functions for safety update notifications
 * Now exclusively uses the database triggers system and ensures comments
 * only create notifications for involved parties, not activity feed items
 */
import { createLogger } from "@/utils/logger";
import { unifiedEvents } from '@/utils/unifiedEventSystem';

// Create a dedicated logger for safety notifications
const logger = createLogger('useSafetyNotifications');

/**
 * Signal that a safety comment has been added
 * Notification is created automatically by database triggers
 * Comments will NOT create activity feed items, only targeted notifications
 * 
 * @param commentId - ID of the new comment
 * @param safetyUpdateId - ID of the safety update that was commented on
 */
export async function notifySafetyComment(
  commentId: string,
  safetyUpdateId: string
): Promise<boolean> {
  try {
    // Log that we're using the database trigger system for targeted notifications only
    logger.debug('Safety comment notification handled by database triggers', {
      commentId, safetyUpdateId
    });
    
    // Signal that notifications might have changed (but not activities)
    unifiedEvents.emit('notification-created');
    unifiedEvents.emit('safety-updated');
    
    return true;
  } catch (err) {
    logger.error('Exception in notifySafetyComment:', err);
    return false;
  }
}

/**
 * Signal that a safety update has been created or changed
 * Notification is created automatically by database triggers
 * 
 * @param safetyUpdateId - ID of the safety update
 * @param action - The action performed (create/update/delete)
 */
export async function notifySafetyChange(
  safetyUpdateId: string,
  action: 'create' | 'update' | 'delete'
): Promise<boolean> {
  try {
    // Log that we're using the database trigger system
    logger.debug('Safety change notification handled by database triggers', {
      safetyUpdateId, action
    });
    
    // Signal that notifications might have changed
    unifiedEvents.emit('notification-created');
    unifiedEvents.emit('safety-updated');
    
    return true;
  } catch (err) {
    logger.error('Exception in notifySafetyChange:', err);
    return false;
  }
}

// Export the hook functions
export function useSafetyNotifications() {
  return {
    notifySafetyComment,
    notifySafetyChange
  };
}

// Also export the functions directly for easier imports
export default {
  notifySafetyComment,
  notifySafetyChange
};
