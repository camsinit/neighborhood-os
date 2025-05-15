
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
const logger = createLogger('fetchDirectNotifications');

/**
 * @deprecated Use notificationClient.fetchNotifications instead
 */
export const fetchDirectNotifications = async (showArchived: boolean): Promise<BaseNotification[]> => {
  logger.warn('fetchDirectNotifications is deprecated. Use notificationClient.fetchNotifications instead.');
  return notificationClient.fetchNotifications(showArchived);
};

/**
 * @deprecated Use notificationClient.processNotifications instead
 */
export const processDirectNotifications = (notifications: any[]): BaseNotification[] => {
  logger.warn('processDirectNotifications is deprecated. Use notificationClient.processNotifications instead.');
  return notificationClient.processNotifications(notifications);
};
