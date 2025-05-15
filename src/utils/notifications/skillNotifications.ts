
/**
 * skillNotifications.ts
 * 
 * Helper utility for sending skill-related notifications via the edge function
 */
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this module
const logger = createLogger('skillNotifications');

/**
 * Interface for skill notification request data
 */
interface SkillNotificationRequest {
  action: 'request' | 'confirm' | 'cancel' | 'reschedule' | 'complete' | 'update';
  skillId: string;
  skillTitle: string;
  providerId: string;
  requesterId: string;
  sessionId?: string;
  sessionTime?: string;
  requestData?: any;
  eventId?: string;
}

/**
 * Send a skill notification via the edge function
 * 
 * @param notificationData - The data needed to create a skill notification
 * @returns Promise resolving to whether the notification was sent successfully
 */
export const sendSkillNotification = async (
  notificationData: SkillNotificationRequest
): Promise<boolean> => {
  try {
    // Log the notification request
    logger.debug(`Sending ${notificationData.action} notification for skill: ${notificationData.skillTitle}`);
    
    // Call the Edge Function to create the notification
    const { data, error } = await supabase.functions.invoke('notify-skills-changes', {
      body: notificationData
    });
    
    if (error) {
      logger.error('Error sending skill notification:', {
        error,
        notificationData
      });
      return false;
    }
    
    logger.debug('Skill notification sent successfully:', {
      result: data,
      action: notificationData.action
    });
    
    return true;
  } catch (err) {
    // Log unexpected errors
    logger.error('Unexpected error sending skill notification:', {
      error: err,
      notificationData
    });
    
    // Show a toast message only for user-facing errors (not background notifications)
    const shouldShowToast = ['request', 'confirm'].includes(notificationData.action);
    
    if (shouldShowToast) {
      toast.error('Failed to send notification. Please try again.');
    }
    
    return false;
  }
};

/**
 * Send a skill request notification
 * 
 * @param skillId - ID of the skill being requested
 * @param skillTitle - Title of the skill
 * @param providerId - ID of the skill provider
 * @param requesterId - ID of the requester
 * @param sessionId - ID of the skill session
 * @param requestData - Additional request data
 */
export const sendSkillRequestNotification = async (
  skillId: string,
  skillTitle: string,
  providerId: string,
  requesterId: string,
  sessionId?: string,
  requestData?: any,
): Promise<void> => {
  await sendSkillNotification({
    action: 'request',
    skillId,
    skillTitle,
    providerId,
    requesterId,
    sessionId,
    requestData
  });
};

/**
 * Send notifications about a confirmed skill session
 */
export const sendSkillConfirmationNotifications = async (
  skillId: string,
  skillTitle: string,
  providerId: string,
  requesterId: string,
  sessionId?: string,
  sessionTime?: string,
  eventId?: string
): Promise<void> => {
  await sendSkillNotification({
    action: 'confirm',
    skillId,
    skillTitle,
    providerId,
    requesterId,
    sessionId,
    sessionTime,
    eventId
  });
};

/**
 * Send notification about a cancelled skill session
 */
export const sendSkillCancellationNotification = async (
  skillId: string,
  skillTitle: string,
  providerId: string, 
  requesterId: string,
  sessionId?: string,
  sessionTime?: string
): Promise<void> => {
  await sendSkillNotification({
    action: 'cancel',
    skillId,
    skillTitle,
    providerId,
    requesterId,
    sessionId,
    sessionTime
  });
};

/**
 * Send notification about a rescheduled skill session
 */
export const sendSkillRescheduleNotification = async (
  skillId: string,
  skillTitle: string,
  providerId: string,
  requesterId: string,
  sessionId?: string,
  sessionTime?: string
): Promise<void> => {
  await sendSkillNotification({
    action: 'reschedule',
    skillId,
    skillTitle,
    providerId,
    requesterId,
    sessionId,
    sessionTime
  });
};

/**
 * Send notification about a completed skill session
 */
export const sendSkillCompletionNotification = async (
  skillId: string,
  skillTitle: string,
  providerId: string,
  requesterId: string,
  sessionId?: string
): Promise<void> => {
  await sendSkillNotification({
    action: 'complete',
    skillId,
    skillTitle,
    providerId,
    requesterId,
    sessionId
  });
};

/**
 * Send notification about an updated skill listing
 */
export const sendSkillUpdateNotification = async (
  skillId: string,
  skillTitle: string,
  providerId: string
): Promise<void> => {
  await sendSkillNotification({
    action: 'update',
    skillId,
    skillTitle,
    providerId,
    requesterId: providerId // In this case, provider is also the actor
  });
};
