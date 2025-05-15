
/**
 * Service responsible for fetching notifications from the database
 */
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this module
const logger = createLogger('notificationFetcher');

/**
 * Fetches notifications from the database with proper error handling
 * 
 * @param userId - The user ID to fetch notifications for
 * @param showArchived - Whether to include archived notifications
 * @returns The raw notification data from the database
 */
export async function fetchNotificationsFromDb(userId: string, showArchived: boolean = false) {
  try {
    logger.debug(`Fetching notifications for user ${userId}, showArchived=${showArchived}`);
    
    // Fetch notifications with a more reliable query
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        profiles:actor_id(display_name, avatar_url)
      `)
      .eq('user_id', userId)
      .eq('is_archived', showArchived)
      .order('created_at', { ascending: false });
      
    if (error) {
      logger.error('Error fetching notifications:', error);
      return [];
    }
    
    logger.debug(`Successfully fetched ${data?.length || 0} notifications`);
    return data || [];
  } catch (error) {
    logger.error('Exception in fetchNotificationsFromDb:', error);
    return [];
  }
}
