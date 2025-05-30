
/**
 * Main function to fetch all notifications from various sources
 * 
 * CLEANED UP: Now only uses direct notifications from the notifications table
 * All legacy fetcher functions have been removed as we've migrated to database-generated notifications
 */
import { BaseNotification } from "./types";
import { fetchDirectNotifications } from "./fetchDirectNotifications";
import { createLogger } from "@/utils/logger";

const logger = createLogger('fetchNotifications');

/**
 * Main function to fetch all notifications from the notifications table
 * This is now the single source of truth for all notifications
 * 
 * @param showArchived Whether to include archived notifications
 * @returns Promise resolving to array of notifications
 */
export const fetchAllNotifications = async (showArchived: boolean): Promise<BaseNotification[]> => {
  logger.debug('Fetching all notifications from notifications table, showArchived:', showArchived);
  
  // Fetch notifications directly from the notifications table
  // This table is populated by database triggers for all notification types
  const directNotifications = await fetchDirectNotifications(showArchived);
  
  // Log the count of notifications found
  logger.debug(`Found ${directNotifications.length} notifications from database`);
  
  return directNotifications;
};
