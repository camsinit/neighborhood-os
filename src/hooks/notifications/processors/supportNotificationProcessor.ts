
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
    user_id: request.user_id || "unknown",
    title: request.title,
    content_type: "support_requests",
    content_id: request.id,
    notification_type: "support", // This matches the HighlightableItemType
    created_at: request.created_at,
    updated_at: request.created_at || request.created_at, // Ensure updated_at is present
    is_read: request.is_read || false,
    is_archived: request.is_archived || false,
    context: {
      contextType: "help_request",
      neighborName: request.profiles?.display_name || null,
      avatarUrl: request.profiles?.avatar_url || null
    }
  }));
};
