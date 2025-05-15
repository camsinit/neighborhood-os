
/**
 * Hook for safety update notifications
 * 
 * This hook provides utility functions for sending notifications
 * when safety updates are created, updated, or commented on
 */
import { createLogger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner"; 
import { refreshEvents } from "@/utils/refreshEvents";

// Create a dedicated logger for safety notifications
const logger = createLogger('useSafetyNotifications');

/**
 * Sends a notification when a safety comment is created
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
    // Log the operation for debugging
    logger.debug('Sending safety comment notification:', {
      commentId, safetyUpdateId, authorId, safetyTitle
    });
    
    // Call the Supabase edge function to notify the safety update author
    const { error } = await supabase.functions.invoke('notify-safety-changes', {
      body: {
        action: 'comment',
        safetyUpdateId,
        commentId,
        safetyUpdateTitle: safetyTitle,
        commentContent: commentPreview
      }
    });
    
    if (error) {
      logger.error('Error sending safety comment notification:', error);
      return false;
    }
    
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
 * Sends a notification when a safety update is created or modified
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
    // Log the operation for debugging
    logger.debug('Sending safety change notification:', {
      safetyUpdateId, action, safetyUpdateTitle
    });
    
    // Call the Supabase edge function to notify relevant users
    const { error } = await supabase.functions.invoke('notify-safety-changes', {
      body: {
        safetyUpdateId,
        action,
        safetyUpdateTitle
      }
    });
    
    if (error) {
      logger.error('Error sending safety change notification:', error);
      return false;
    }
    
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
