
/**
 * Centralized type definitions for notifications
 * 
 * This file contains all types related to notifications for better type consistency
 * across the application. These types define the structure of notification data
 * and help ensure type safety when working with notifications.
 */

/**
 * Base notification interface that all notification types extend from
 * This provides a common structure for rendering and handling notifications
 * 
 * @property {string} id - Unique identifier for the notification
 * @property {string} user_id - ID of the user who should receive this notification
 * @property {string} title - Main notification text
 * @property {string} actor_id - ID of the user who triggered the notification (optional)
 * @property {string} content_type - Type of content this notification relates to (event, skill, etc.)
 * @property {string} content_id - ID of the related content item
 * @property {string} notification_type - Category of notification (event, safety, goods, etc.)
 * @property {string} action_type - Action associated with this notification (view, respond, etc.)
 * @property {string} action_label - Text for the action button (optional)
 * @property {boolean} is_read - Whether this notification has been viewed
 * @property {boolean} is_archived - Whether this notification has been archived
 * @property {string} created_at - Timestamp when notification was created
 * @property {string} updated_at - Timestamp when notification was last updated
 * @property {string|null} description - Optional additional details
 * @property {ProfileData|null} profiles - User profile data for the actor
 * @property {Record<string, any>} context - Additional structured data relevant to this notification
 * @property {number} relevance_score - Importance score for sorting (higher = more important)
 */
export interface BaseNotification {
  id: string;
  user_id: string;
  title: string;
  actor_id?: string;
  content_type: string;
  content_id: string;
  notification_type: string;
  action_type: string;
  action_label?: string; // Made optional to accommodate existing code
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  description?: string | null;
  profiles?: ProfileData | null;
  context?: Record<string, any>;
  relevance_score?: number; // Added this field since it's used in processors
}

/**
 * Profile data interface for notification contexts
 * Contains user information needed for displaying notifications
 * 
 * @property {string} display_name - User's display name
 * @property {string} avatar_url - URL to user's profile image
 * @property {string} id - User's unique identifier
 */
export interface ProfileData {
  display_name?: string;
  avatar_url?: string;
  id?: string;
}

/**
 * Type for skill request notifications
 * Used for rendering skill request popover/drawer
 * 
 * @property {string} skillId - ID of the requested skill
 * @property {string} skillTitle - Title of the requested skill
 * @property {string} requesterId - User ID of the requester
 * @property {string} requesterName - Display name of the requester
 * @property {string} requesterAvatar - Avatar URL of the requester
 * @property {string[]} timePreferences - Array of preferred time slots
 * @property {string} availability - General availability description
 */
export interface SkillRequestNotification {
  skillId: string;
  skillTitle: string;
  requesterId: string;
  requesterName?: string;
  requesterAvatar?: string;
  timePreferences?: string[];
  availability?: string;
}

/**
 * Type guard to check if a notification is a skill request
 * 
 * @param notification - The notification to check
 * @returns True if the notification is a skill request
 */
export function isSkillRequestNotification(notification: BaseNotification): boolean {
  return notification.notification_type === 'skills' && 
         notification.context?.contextType === 'skill_request';
}

/**
 * Type guard to check if a notification is event-related
 * 
 * @param notification - The notification to check
 * @returns True if the notification is event-related
 */
export function isEventNotification(notification: BaseNotification): boolean {
  return notification.notification_type === 'event';
}

/**
 * Helper function to extract profile display name with fallbacks
 * 
 * @param notification - The notification to extract from
 * @returns The display name with fallbacks
 */
export function getActorName(notification: BaseNotification): string {
  return notification.profiles?.display_name || 
         notification.context?.neighborName || 
         "A neighbor";
}
