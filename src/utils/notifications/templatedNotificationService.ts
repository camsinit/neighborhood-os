/**
 * Templated Notification Service
 * 
 * Enhanced notification service that uses predefined templates for consistent,
 * natural language notifications that are personally relevant to users
 */
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";
import { unifiedEvents } from "@/utils/unifiedEventSystem";
import { 
  processNotificationTemplate, 
  getNotificationTemplate,
  type NotificationTemplate 
} from "./notificationTemplates";

// Create a dedicated logger for the templated notification service
const logger = createLogger('templatedNotificationService');

/**
 * Interface for creating templated notifications
 */
export interface TemplatedNotificationParams {
  templateId: string;           // ID of the template to use
  recipientUserId: string;      // Who receives the notification
  actorUserId?: string;         // Who triggered the action (optional for system notifications)
  contentId: string;            // ID of the related content
  variables: Record<string, string>; // Variables to substitute in template
  metadata?: Record<string, any>;    // Additional structured data
}

/**
 * Creates a notification using a predefined template
 * This ensures consistent language and only creates personally relevant notifications
 * 
 * @param params Templated notification parameters
 * @returns Promise resolving to created notification ID if successful
 */
export async function createTemplatedNotification(params: TemplatedNotificationParams): Promise<string | null> {
  try {
    logger.debug('Creating templated notification:', params);

    // Process the template with variables
    const processed = processNotificationTemplate(params.templateId, params.variables);
    
    if (!processed) {
      logger.error(`Template processing failed for: ${params.templateId}`);
      return null;
    }

    const { title, template } = processed;

    // Use the database function for consistent handling
    const { data, error } = await supabase
      .rpc('create_unified_system_notification', {
        p_user_id: params.recipientUserId,
        p_actor_id: params.actorUserId || null,
        p_title: title,
        p_content_type: template.contentType,
        p_content_id: params.contentId,
        p_notification_type: template.notificationType as any, // Type cast for enum compatibility
        p_action_type: template.actionType as any, // Type cast for enum compatibility
        p_action_label: template.actionLabel,
        p_relevance_score: template.relevanceScore,
        p_metadata: {
          templateId: params.templateId,
          variables: params.variables,
          ...params.metadata
        }
      });

    if (error) {
      logger.error('Error creating templated notification:', error);
      return null;
    }

    logger.debug('Templated notification created successfully:', {
      id: data,
      title,
      template: params.templateId
    });
    
    // Emit event using the unified system
    unifiedEvents.emit('notifications');
    
    return data;
  } catch (error) {
    logger.error('Exception creating templated notification:', error);
    return null;
  }
}

/**
 * Creates a group event notification for all group members
 */
export async function createGroupEventNotification(
  groupId: string,
  creatorId: string,
  eventId: string,
  eventTitle: string,
  creatorName: string
): Promise<string | null> {
  try {
    logger.debug('Creating group event notifications for group:', groupId);
    
    // Get all group members except the creator
    const { data: groupMembers, error } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .neq('user_id', creatorId);
    
    if (error) {
      logger.error('Error fetching group members:', error);
      return null;
    }
    
    if (!groupMembers || groupMembers.length === 0) {
      logger.debug('No group members to notify');
      return null;
    }
    
    // Create notifications for all group members
    const notifications = groupMembers.map(member =>
      createTemplatedNotification({
        templateId: 'group_event_created',
        recipientUserId: member.user_id,
        actorUserId: creatorId,
        contentId: eventId,
        variables: {
          actor: creatorName,
          title: eventTitle
        },
        metadata: {
          groupId,
          eventId,
          creatorId
        }
      })
    );
    
    await Promise.all(notifications);
    logger.debug(`Created ${notifications.length} group event notifications`);
    
    return eventId;
  } catch (error) {
    logger.error('Error creating group event notifications:', error);
    return null;
  }
}

/**
 * Helper function to create an event RSVP notification
 */
export async function createEventRSVPNotification(
  eventHostId: string,
  rsvpUserId: string,
  eventId: string,
  eventTitle: string,
  actorName: string
): Promise<string | null> {
  return createTemplatedNotification({
    templateId: 'event_rsvp',
    recipientUserId: eventHostId,
    actorUserId: rsvpUserId,
    contentId: eventId,
    variables: {
      actor: actorName,
      title: eventTitle
    },
    metadata: {
      eventId,
      type: 'rsvp'
    }
  });
}

/**
 * Helper function to create a skill session request notification
 */
export async function createSkillSessionRequestNotification(
  skillProviderId: string,
  requesterId: string,
  skillId: string,
  skillTitle: string,
  requesterName: string
): Promise<string | null> {
  return createTemplatedNotification({
    templateId: 'skill_session_request',
    recipientUserId: skillProviderId,
    actorUserId: requesterId,
    contentId: skillId,
    variables: {
      actor: requesterName,
      title: skillTitle
    },
    metadata: {
      skillId,
      type: 'session_request'
    }
  });
}

/**
 * Helper function to create a new neighbor notification
 */
export async function createNeighborJoinedNotification(
  existingNeighborId: string,
  newNeighborId: string,
  newNeighborName: string
): Promise<string | null> {
  return createTemplatedNotification({
    templateId: 'neighbor_joined',
    recipientUserId: existingNeighborId,
    actorUserId: newNeighborId,
    contentId: newNeighborId,
    variables: {
      actor: newNeighborName
    },
    metadata: {
      neighborId: newNeighborId,
      type: 'welcome'
    }
  });
}

/**
 * Helper function to create a safety comment notification
 */
export async function createSafetyCommentNotification(
  safetyReporterId: string,
  commenterId: string,
  safetyUpdateId: string,
  safetyTitle: string,
  commenterName: string
): Promise<string | null> {
  return createTemplatedNotification({
    templateId: 'safety_comment',
    recipientUserId: safetyReporterId,
    actorUserId: commenterId,
    contentId: safetyUpdateId,
    variables: {
      actor: commenterName,
      title: safetyTitle
    },
    metadata: {
      safetyUpdateId,
      type: 'comment'
    }
  });
}

/**
 * Helper function to create a goods response notification
 */
export async function createGoodsResponseNotification(
  requesterId: string,
  responderId: string,
  goodsId: string,
  goodsTitle: string,
  responderName: string
): Promise<string | null> {
  return createTemplatedNotification({
    templateId: 'goods_response',
    recipientUserId: requesterId,
    actorUserId: responderId,
    contentId: goodsId,
    variables: {
      actor: responderName,
      title: goodsTitle
    },
    metadata: {
      goodsId,
      type: 'response'
    }
  });
}

/**
 * Helper function to create a care response notification
 */
export async function createCareResponseNotification(
  requesterId: string,
  responderId: string,
  careId: string,
  careTitle: string,
  responderName: string
): Promise<string | null> {
  return createTemplatedNotification({
    templateId: 'care_response',
    recipientUserId: requesterId,
    actorUserId: responderId,
    contentId: careId,
    variables: {
      actor: responderName,
      title: careTitle
    },
    metadata: {
      careId,
      type: 'response'
    }
  });
}


/**
 * Helper function to create a skill session cancellation notification
 */
export async function createSkillSessionCancelledNotification(
  recipientId: string,
  actorId: string,
  sessionId: string,
  skillTitle: string,
  actorName: string
): Promise<string | null> {
  return createTemplatedNotification({
    templateId: 'skill_session_cancelled',
    recipientUserId: recipientId,
    actorUserId: actorId,
    contentId: sessionId,
    variables: {
      actor: actorName,
      title: skillTitle
    },
    metadata: {
      sessionId,
      type: 'cancellation'
    }
  });
}

export default {
  createTemplatedNotification,
  createEventRSVPNotification,
  createSkillSessionRequestNotification,
  createNeighborJoinedNotification,
  createSafetyCommentNotification,
  createGoodsResponseNotification,
  createCareResponseNotification,
  createSkillSessionCancelledNotification
};
