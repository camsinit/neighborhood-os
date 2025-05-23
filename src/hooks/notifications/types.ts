
/**
 * Centralized type definitions for notifications
 * This file contains all types related to notifications for better type consistency
 */

/**
 * Base notification interface that all notification types extend from
 * This provides a common structure for rendering and handling notifications
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
  metadata?: Record<string, any>; // Add metadata field to resolve type error
}

/**
 * Profile data interface for notification contexts
 */
export interface ProfileData {
  display_name?: string;
  avatar_url?: string;
  id?: string;
}

/**
 * Type for skill request notifications
 * Used for rendering skill request popover/drawer
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
