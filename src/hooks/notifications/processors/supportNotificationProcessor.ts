
/**
 * This file handles the processing of support notifications
 * It contains utility functions for transforming support notification data
 */
import { BaseNotification } from "../types";

/**
 * Processes support request notifications
 * 
 * @param supportRequests - The support requests data from the database
 * @returns An array of processed notifications
 */
export const processSupportNotifications = (supportRequests: any[]): BaseNotification[] => {
  console.log("[processSupportNotifications] Processing support notifications:", supportRequests.length);
  
  return supportRequests.map(request => ({
    id: request.id,
    title: request.title,
    type: "support" as const,
    created_at: request.created_at,
    is_read: request.is_read,
    is_archived: request.is_archived,
    context: {
      contextType: "help_request" as const,
      neighborName: request.profiles?.display_name || null,
      avatarUrl: request.profiles?.avatar_url || null
    }
  }));
};
