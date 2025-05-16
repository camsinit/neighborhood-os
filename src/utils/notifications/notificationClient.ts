
/**
 * notificationClient.ts
 * 
 * A unified client for interacting with the notifications system.
 * This provides a clean API for all notification-related operations.
 * 
 * Notification Flow:
 * 1. Notifications are created via database functions or triggers
 * 2. The client fetches notifications using the appropriate services
 * 3. Notifications are processed and formatted for display
 * 4. Components subscribe to notification updates via React Query
 * 5. User interactions trigger read/archive operations
 * 6. Events are emitted to update related components
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
 * and provides consistent error handling. It serves as the main
 * entry point for components that need to interact with notifications.
 */
export const notificationClient = {
  /**
   * Fetch all notifications for the current user
   * 
   * This method:
   * 1. Gets the current authenticated user
   * 2. Fetches their notifications from the database
   * 3. Processes them to standardize format
   * 4. Returns the processed notifications
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
   * 
   * This is a convenience wrapper around the service function
   * that handles getting the current user and error logging.
   * 
   * @returns Promise resolving to boolean indicating success
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
