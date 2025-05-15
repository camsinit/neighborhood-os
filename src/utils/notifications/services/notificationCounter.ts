
/**
 * Service responsible for counting notifications
 */
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this module
const logger = createLogger('notificationCounter');

/**
 * Get unread notification count for a user
 * 
 * @param userId - The user ID to count notifications for
 * @returns Promise resolving to number of unread notifications
 */
export async function getUnreadCount(userId?: string): Promise<number> {
  try {
    if (!userId) {
      logger.debug('No user ID provided, returning 0 unread notifications');
      return 0;
    }
    
    logger.debug(`Getting unread notification count for user ${userId}`);
    
    // Use count query for efficiency
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .eq('is_archived', false);
      
    if (error) {
      logger.error('Error getting unread count:', error);
      return 0;
    }
    
    logger.debug(`Found ${count || 0} unread notifications`);
    return count || 0;
  } catch (error) {
    logger.error('Exception in getUnreadCount:', error);
    return 0;
  }
}
