
/**
 * This file is deprecated and will be removed in a future update.
 * Please use notificationClient instead.
 * 
 * @deprecated Use notificationClient.fetchNotifications instead
 */
import { BaseNotification } from "./types";
import { notificationClient } from "@/utils/notifications/notificationClient";
import { createLogger } from "@/utils/logger";

// Create warning logger
const logger = createLogger('fetchNotifications');

/**
 * @deprecated Use notificationClient.fetchNotifications instead
 */
export const fetchAllNotifications = async (showArchived: boolean): Promise<BaseNotification[]> => {
  logger.warn('fetchAllNotifications is deprecated. Use notificationClient.fetchNotifications instead.');
  return notificationClient.fetchNotifications(showArchived);
};
