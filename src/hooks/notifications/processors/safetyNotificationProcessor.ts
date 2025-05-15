
/**
 * This file handles the processing of safety notifications
 * It contains utility functions for transforming safety notification data
 */
import { BaseNotification } from "../types";

/**
 * Processes safety update notifications
 * 
 * @param safetyUpdates - The safety updates data from the database
 * @returns An array of processed notifications
 */
export const processSafetyNotifications = (safetyUpdates: any[]): BaseNotification[] => {
  console.log("[processSafetyNotifications] Processing safety notifications:", safetyUpdates.length);
  
  return safetyUpdates.map(update => {
    // Extract profile data if available, provide fallbacks if not
    const neighborName = update.profiles?.display_name || "A neighbor";
    const avatarUrl = update.profiles?.avatar_url || null;
    
    // Extract type or assign default
    const safetyType = update.type || 'alert';
    
    // Create context object with rich information for notification rendering
    const context = {
      contextType: "safety_alert",
      neighborName,
      avatarUrl,
      safetyType,
      // Add descriptive summary
      summary: update.description || `Important safety information from ${neighborName}`
    };
    
    return {
      id: update.id,
      user_id: update.author_id || "unknown",
      title: update.title,
      content_type: "safety_updates",
      content_id: update.id,
      notification_type: "safety",
      action_type: "create",
      action_label: "View Safety Update", // Added required field
      created_at: update.created_at,
      updated_at: update.created_at || update.created_at,
      is_read: update.is_read || false,
      is_archived: update.is_archived || false,
      context,
      profiles: update.profiles || null
    };
  });
};

/**
 * Processes safety comment notifications
 * 
 * @param comments - The safety comment data from the database
 * @returns An array of processed notifications
 */
export const processSafetyCommentNotifications = (comments: any[]): BaseNotification[] => {
  console.log("[processSafetyCommentNotifications] Processing safety comment notifications:", comments.length);
  
  return comments.map(comment => {
    // Extract profile data if available
    const commenterName = comment.commenter_profile?.display_name || "A neighbor";
    const avatarUrl = comment.commenter_profile?.avatar_url || null;
    
    // Create context object with rich information for notification rendering
    const context = {
      contextType: "safety_comment",
      neighborName: commenterName,
      avatarUrl,
      safetyUpdateId: comment.safety_update_id,
      commentPreview: comment.content?.substring(0, 50) || "New comment"
    };
    
    return {
      id: comment.id,
      user_id: comment.user_id || "unknown",
      title: `Comment on safety update: ${comment.safety_update_title || ""}`,
      content_type: "safety_comment",
      content_id: comment.safety_update_id,
      notification_type: "safety",
      action_type: "view",
      action_label: "View Comment", // Added required field
      created_at: comment.created_at,
      updated_at: comment.created_at,
      is_read: comment.is_read || false,
      is_archived: comment.is_archived || false,
      context,
      profiles: comment.commenter_profile || null
    };
  });
};
