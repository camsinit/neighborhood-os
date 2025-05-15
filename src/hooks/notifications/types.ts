
/**
 * Types for the notification system
 */

/**
 * Base notification type
 */
export interface BaseNotification {
  id: string;
  user_id: string;
  actor_id: string;
  title: string;
  description?: string;
  content_type: string;
  content_id: string;
  notification_type: string;
  action_type: string;
  action_label: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  relevance_score?: number;
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  } | null;
  metadata?: any;
}

/**
 * Parameters for creating a notification
 */
export interface NotificationParams {
  userId: string;
  actorId: string;
  title: string;
  contentType: string;
  contentId: string;
  notificationType: string;
  actionType?: string;
  actionLabel?: string;
  metadata?: any;
  relevanceScore?: number;
}
