
/**
 * notificationClient.ts
 * 
 * A unified client for interacting with the notifications system.
 * This provides a clean API for all notification-related operations.
 */
import { supabase } from "@/integrations/supabase/client";
import { BaseNotification } from "@/hooks/notifications/types";
import { createLogger } from "@/utils/logger";
import { fetchNotificationsFromDb } from "./services/notificationFetcher";
import { processNotifications } from "./services/notificationProcessor";
import { markAsRead, archiveNotification, markAllAsRead } from "./services/notificationUpdater";
import { getUnreadCount } from "./services/notificationCounter";

// Create a dedicated logger for this module
const logger = createLogger('notificationClient');

/**
 * Unified Notification Client
 * 
 * This client handles all API interactions for notifications
 * and provides consistent error handling.
 */
export const notificationClient = {
  /**
   * Fetch all notifications for the current user
   * 
   * @param showArchived - Whether to include archived notifications
   * @returns Promise resolving to array of notifications
   */
  async fetchNotifications(showArchived: boolean = false): Promise<BaseNotification[]> {
    try {
      // Get the current user
      const { data: user } = await supabase.auth.getUser();
      const userId = user.user?.id;
      
      if (!userId) {
        logger.debug('No user authenticated, returning empty notifications array');
        return [];
      }
      
      // Fetch notifications using the fetcher service
      const rawNotifications = await fetchNotificationsFromDb(userId, showArchived);
      
      // Process notifications to standardize format
      return this.processNotifications(rawNotifications);
    } catch (error) {
      logger.error('Exception in fetchNotifications:', error);
      return [];
    }
  },
  
  // Re-export functions from services
  markAsRead,
  archiveNotification,
  
  /**
   * Mark all notifications as read for the current user
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      // Get current user
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        logger.error('No authenticated user found');
        return false;
      }
      
      return markAllAsRead(user.user.id);
    } catch (error) {
      logger.error('Exception in markAllAsRead wrapper:', error);
      return false;
    }
  },
  
  // Re-export counter function
  getUnreadCount,
  
  // Re-export processor function
  processNotifications
};

// Export default for easy imports
export default notificationClient;
