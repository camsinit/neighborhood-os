
/**
 * Hook for safety update notifications
 * 
 * This hook provides utility functions for safety update notifications
 * Now uses the database triggers directly (no edge function calls)
 */
import { createLogger } from "@/utils/logger";
import { refreshEvents } from "@/utils/refreshEvents";

// Create a dedicated logger for safety notifications
const logger = createLogger('useSafetyNotifications');

/**
 * Legacy compatibility function for safety comment notifications
 * Now the notification is created by a database trigger automatically
 * 
 * @param commentId - ID of the new comment
 * @param safetyUpdateId - ID of the safety update that was commented on
 * @param authorId - ID of the safety update author (recipient)
 * @param safetyTitle - Title of the safety update
 * @param commentPreview - Preview text of the comment (first 50 chars)
 */
export async function notifySafetyComment(
  commentId: string,
  safetyUpdateId: string,
  authorId: string,
  safetyTitle: string,
  commentPreview: string
): Promise<boolean> {
  try {
    // Log that we're using the database trigger system
    logger.info('Safety comment notification is now handled by database triggers', {
      commentId, safetyUpdateId
    });
    
    // Signal that notifications might have changed
    refreshEvents.emit('notification-created');
    refreshEvents.emit('safety-updated');
    
    return true;
  } catch (err) {
    logger.error('Exception in notifySafetyComment:', err);
    return false;
  }
}

/**
 * Legacy compatibility function for safety update notifications
 * Now the notification is created by a database trigger automatically
 * 
 * @param safetyUpdateId - ID of the safety update
 * @param action - The action performed (create/update)
 * @param safetyUpdateTitle - Title of the safety update
 */
export async function notifySafetyChange(
  safetyUpdateId: string,
  action: 'create' | 'update' | 'delete',
  safetyUpdateTitle: string
): Promise<boolean> {
  try {
    // Log that we're using the database trigger system
    logger.info('Safety change notification is now handled by database triggers', {
      safetyUpdateId, action, safetyUpdateTitle
    });
    
    // Signal that notifications might have changed
    refreshEvents.emit('notification-created');
    refreshEvents.emit('safety-updated');
    
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
