
/**
 * Unified Notification Service
 * 
 * This service provides a centralized API for working with notifications.
 * It handles creating, updating, and managing notifications consistently across the application.
 * 
 * UPDATED: Now uses the database function create_unified_system_notification as single source of truth
 */
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createLogger } from "@/utils/logger";
import { refreshEvents } from "@/utils/refreshEvents";

// Create a dedicated logger for the notification service
const logger = createLogger('notificationService');

/**
 * Notification types supported by the system
 * NOTE: Must match the database enum values
 */
export type NotificationType = 'event' | 'safety' | 'care' | 'goods' | 'skills' | 'neighbor_welcome' | 'community';

/**
 * Action types for notifications
 * NOTE: Must match the database enum values
 */
export type NotificationActionType = 'view' | 'respond' | 'schedule' | 'help' | 'learn' | 'rsvp' | 'comment' | 'share';

/**
 * Interface for notification creation parameters
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
 * Creates a new notification using the database function as single source of truth
 * 
 * @param params Notification parameters
 * @returns Promise resolving to created notification ID if successful
 */
export async function createNotification(params: NotificationParams): Promise<string | null> {
  try {
    logger.debug('Creating notification via unified system:', params);

    // Use the database function instead of direct insert
    // This provides consistent handling, duplicate prevention, etc.
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

    // The database function returns the notification ID directly
    logger.debug('Notification created successfully via unified system:', data);
    
    // Emit event using the improved event system
    refreshEvents.emit('notification-created');
    
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

/**
 * Create an event RSVP notification for the event host
 * 
 * @param eventId ID of the event
 * @param hostId ID of the event host
 * @param eventTitle Title of the event
 * @returns Promise resolving to the notification ID if successful
 */
export async function createRsvpNotification(
  eventId: string,
  hostId: string,
  eventTitle: string
): Promise<string | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      logger.error('No authenticated user found for RSVP notification');
      return null;
    }

    // Don't notify for self-RSVPs
    if (user.user.id === hostId) {
      logger.debug('Skipping self-RSVP notification');
      return null;
    }

    return createNotification({
      userId: hostId,
      actorId: user.user.id,
      title: `New RSVP for ${eventTitle}`,
      contentType: 'events',
      contentId: eventId,
      notificationType: 'event',
      actionType: 'view',
      actionLabel: 'View Event',
      relevanceScore: 3, // High importance
      metadata: {
        event_id: eventId,
        type: 'rsvp'
      }
    });
  } catch (error) {
    logger.error('Exception creating RSVP notification:', error);
    return null;
  }
}

/**
 * Create a notification for a new skill session request
 * 
 * @param sessionId ID of the skill session
 * @param providerId ID of the skill provider
 * @param skillId ID of the requested skill
 * @param skillTitle Title of the skill
 * @returns Promise resolving to the notification ID if successful
 */
export async function createSkillRequestNotification(
  sessionId: string,
  providerId: string,
  skillId: string,
  skillTitle: string
): Promise<string | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      logger.error('No authenticated user found for skill request notification');
      return null;
    }

    return createNotification({
      userId: providerId,
      actorId: user.user.id,
      title: `New request for your skill: ${skillTitle}`,
      contentType: 'skill_request',
      contentId: sessionId,
      notificationType: 'skills',
      actionType: 'respond',
      actionLabel: 'Respond',
      relevanceScore: 3, // High importance
      metadata: {
        skill_id: skillId,
        session_id: sessionId,
        skill_title: skillTitle
      }
    });
  } catch (error) {
    logger.error('Exception creating skill request notification:', error);
    return null;
  }
}

/**
 * Create a notification for new time slots added to a skill session
 * 
 * @param sessionId ID of the skill session
 * @param requesterId ID of the skill requester
 * @param skillTitle Title of the skill
 * @returns Promise resolving to the notification ID if successful
 */
export async function createTimeSlotNotification(
  sessionId: string,
  requesterId: string,
  skillTitle: string
): Promise<string | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      logger.error('No authenticated user found for time slot notification');
      return null;
    }

    return createNotification({
      userId: requesterId,
      actorId: user.user.id,
      title: `New time slots available for ${skillTitle}`,
      contentType: 'skill_session',
      contentId: sessionId,
      notificationType: 'skills',
      actionType: 'schedule',
      actionLabel: 'Choose Time',
      relevanceScore: 3, // High importance
      metadata: {
        session_id: sessionId,
        status: 'pending_requester_confirmation'
      }
    });
  } catch (error) {
    logger.error('Exception creating time slot notification:', error);
    return null;
  }
}

/**
 * Create a notification for a safety update comment
 * 
 * @param commentId ID of the comment
 * @param safetyUpdateId ID of the safety update
 * @param authorId ID of the safety update author
 * @param safetyTitle Title of the safety update
 * @param commentPreview Preview of the comment content
 * @returns Promise resolving to the notification ID if successful
 */
export async function createSafetyCommentNotification(
  commentId: string,
  safetyUpdateId: string,
  authorId: string,
  safetyTitle: string,
  commentPreview: string
): Promise<string | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) {
      logger.error('No authenticated user found for safety comment notification');
      return null;
    }

    // Don't notify if commenter is the author
    if (user.user.id === authorId) {
      logger.debug('Skipping self-comment notification');
      return null;
    }

    return createNotification({
      userId: authorId,
      actorId: user.user.id,
      title: `New comment on your safety update: ${safetyTitle}`,
      contentType: 'safety_comment',
      contentId: commentId,
      notificationType: 'safety',
      actionType: 'view',
      actionLabel: 'View Comment',
      relevanceScore: 3, // High importance
      metadata: {
        safety_update_id: safetyUpdateId,
        comment_id: commentId,
        comment_preview: commentPreview.substring(0, 50)
      }
    });
  } catch (error) {
    logger.error('Exception creating safety comment notification:', error);
    return null;
  }
}

export default {
  createNotification,
  markAsRead,
  archiveNotification,
  markAllAsRead,
  getUnreadCount,
  createRsvpNotification,
  createSkillRequestNotification,
  createTimeSlotNotification,
  createSafetyCommentNotification
};
