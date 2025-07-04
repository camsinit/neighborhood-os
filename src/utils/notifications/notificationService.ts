/**
 * Unified Notification Service
 * 
 * This service provides a centralized API for working with notifications.
 * It exclusively uses database functions and triggers for notification creation.
 * 
 * RULES:
 * - Notifications are ONLY for personally relevant content
 * - General content updates go to the activity feed only
 * - No notifications for profile updates or event updates
 * 
 * UPDATED: Now uses templated notifications for consistent language
 */
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";
import { unifiedEvents } from "@/utils/unifiedEventSystem";
import { 
  createTemplatedNotification,
  createEventRSVPNotification,
  createSkillSessionRequestNotification,
  createNeighborJoinedNotification,
  createSafetyCommentNotification,
  createGoodsResponseNotification,
  createCareResponseNotification,
  createSkillSessionConfirmedNotification,
  createSkillSessionCancelledNotification
} from "./templatedNotificationService";

// Create a dedicated logger for the notification service
const logger = createLogger('notificationService');

/**
 * Notification types supported by the system
 * NOTE: Must match the database enum values
 */
export type NotificationType = 'event' | 'safety' | 'care' | 'goods' | 'skills' | 'neighbor_welcome';

/**
 * Action types for notifications
 * NOTE: Must match the database enum values
 */
export type NotificationActionType = 'view' | 'respond' | 'schedule' | 'help' | 'learn' | 'rsvp' | 'comment' | 'share';

/**
 * Interface for notification creation parameters
 * NOTE: This is now legacy - prefer using templated notifications
 */
export interface NotificationParams {
  userId: string;              // Who receives the notification
  actorId?: string;            // Who triggered the action (optional for system notifications)
  title: string;               // Notification title/summary
  contentType: string;         // Type of content (event, skill, good, etc.)
  contentId: string;           // ID of the related content
  notificationType: NotificationType;  // Category of notification
  actionType?: NotificationActionType; // Action to take (view, respond, etc.)
  actionLabel?: string;        // Label for the action button
  relevanceScore?: number;     // Importance score (1-3, with 3 being most important)
  metadata?: Record<string, any>; // Additional structured data
}

/**
 * Creates a new notification using the database function
 * 
 * @deprecated Use createTemplatedNotification instead for consistent language
 * @param params Notification parameters
 * @returns Promise resolving to created notification ID if successful
 */
export async function createNotification(params: NotificationParams): Promise<string | null> {
  try {
    logger.debug('Creating notification via database function (legacy):', params);

    // Use the database function for consistent handling
    const { data, error } = await supabase
      .rpc('create_unified_system_notification', {
        p_user_id: params.userId,
        p_actor_id: params.actorId || null,
        p_title: params.title,
        p_content_type: params.contentType,
        p_content_id: params.contentId,
        p_notification_type: params.notificationType,
        p_action_type: params.actionType || 'view',
        p_action_label: params.actionLabel || 'View',
        p_relevance_score: params.relevanceScore || 1,
        p_metadata: params.metadata || {}
      });

    if (error) {
      logger.error('Error creating notification:', error);
      return null;
    }

    // The database function returns the notification ID
    logger.debug('Notification created successfully:', data);
    
    // Emit event using the unified system
    unifiedEvents.emit('notifications');
    
    return data;
  } catch (error) {
    logger.error('Exception creating notification:', error);
    return null;
  }
}

/**
 * Mark a notification as read
 * 
 * @param notificationId ID of the notification to mark as read
 * @returns Promise resolving to boolean indicating success
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
  try {
    logger.debug(`Marking notification ${notificationId} as read`);

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      logger.error(`Error marking notification ${notificationId} as read:`, error);
      return false;
    }

    logger.debug(`Successfully marked notification ${notificationId} as read`);
    return true;
  } catch (error) {
    logger.error(`Exception marking notification as read:`, error);
    return false;
  }
}

/**
 * Archive a notification
 * 
 * @param notificationId ID of the notification to archive
 * @returns Promise resolving to boolean indicating success
 */
export async function archiveNotification(notificationId: string): Promise<boolean> {
  try {
    logger.debug(`Archiving notification ${notificationId}`);

    const { error } = await supabase
      .from('notifications')
      .update({ is_archived: true })
      .eq('id', notificationId);

    if (error) {
      logger.error(`Error archiving notification ${notificationId}:`, error);
      return false;
    }

    logger.debug(`Successfully archived notification ${notificationId}`);
    return true;
  } catch (error) {
    logger.error(`Exception archiving notification:`, error);
    return false;
  }
}

/**
 * Mark all notifications as read for the current user
 * 
 * @returns Promise resolving to boolean indicating success
 */
export async function markAllAsRead(): Promise<boolean> {
  try {
    logger.debug('Marking all notifications as read for current user');

    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      logger.error('No authenticated user found');
      return false;
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.user.id)
      .eq('is_read', false);

    if (error) {
      logger.error('Error marking all notifications as read:', error);
      return false;
    }

    logger.debug('Successfully marked all notifications as read');
    return true;
  } catch (error) {
    logger.error('Exception marking all notifications as read:', error);
    return false;
  }
}

/**
 * Get unread notification count for the current user
 * 
 * @returns Promise resolving to the count of unread notifications
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      logger.error('No authenticated user found');
      return 0;
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.user.id)
      .eq('is_read', false)
      .eq('is_archived', false);

    if (error) {
      logger.error('Error getting unread count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    logger.error('Exception getting unread count:', error);
    return 0;
  }
}

export default {
  // Legacy functions (deprecated)
  createNotification,
  markAsRead,
  archiveNotification,
  markAllAsRead,
  getUnreadCount,
  
  // New templated functions (recommended)
  createTemplatedNotification,
  createEventRSVPNotification,
  createSkillSessionRequestNotification,
  createNeighborJoinedNotification,
  createSafetyCommentNotification,
  createGoodsResponseNotification,
  createCareResponseNotification,
  createSkillSessionConfirmedNotification,
  createSkillSessionCancelledNotification
};
