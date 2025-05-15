
/**
 * skillNotifications.ts
 * 
 * Helper utility for triggering UI refreshes after skill-related database events
 * Replaces the old edge function implementation
 */
import { refreshEvents } from "@/utils/refreshEvents";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this module
const logger = createLogger('skillNotifications');

/**
 * Signal that a skill has been requested
 * Notification is created automatically by database triggers
 * 
 * @param skillId - ID of the skill being requested
 * @param skillTitle - Title of the skill
 */
export const sendSkillRequestNotification = async (
  skillId: string,
  skillTitle: string
): Promise<void> => {
  logger.debug(`Skill request for ${skillTitle} - DB trigger will handle notification`);
  refreshEvents.emit('skills-updated');
  refreshEvents.emit('notification-created');
};

/**
 * Signal that a skill session has been confirmed
 * Notification is created automatically by database triggers
 * 
 * @param skillTitle - Title of the skill
 */
export const sendSkillConfirmationNotifications = async (
  skillTitle: string
): Promise<void> => {
  logger.debug(`Skill confirmation for ${skillTitle} - DB trigger will handle notification`);
  refreshEvents.emit('skills-updated');
  refreshEvents.emit('notification-created');
};

/**
 * Signal that a skill session has been cancelled
 * Notification is created automatically by database triggers
 * 
 * @param skillTitle - Title of the skill
 */
export const sendSkillCancellationNotification = async (
  skillTitle: string
): Promise<void> => {
  logger.debug(`Skill cancellation for ${skillTitle} - DB trigger will handle notification`);
  refreshEvents.emit('skills-updated');
  refreshEvents.emit('notification-created');
};

/**
 * Signal that a skill session has been rescheduled
 * Notification is created automatically by database triggers
 * 
 * @param skillTitle - Title of the skill
 */
export const sendSkillRescheduleNotification = async (
  skillTitle: string
): Promise<void> => {
  logger.debug(`Skill reschedule for ${skillTitle} - DB trigger will handle notification`);
  refreshEvents.emit('skills-updated');
  refreshEvents.emit('notification-created');
};

/**
 * Signal that a skill session has been completed
 * Notification is created automatically by database triggers
 * 
 * @param skillTitle - Title of the skill
 */
export const sendSkillCompletionNotification = async (
  skillTitle: string
): Promise<void> => {
  logger.debug(`Skill completion for ${skillTitle} - DB trigger will handle notification`);
  refreshEvents.emit('skills-updated');
  refreshEvents.emit('notification-created');
};

/**
 * Signal that a skill listing has been updated
 * Notification is created automatically by database triggers
 * 
 * @param skillTitle - Title of the skill
 */
export const sendSkillUpdateNotification = async (
  skillTitle: string
): Promise<void> => {
  logger.debug(`Skill update for ${skillTitle} - DB trigger will handle notification`);
  refreshEvents.emit('skills-updated');
  refreshEvents.emit('notification-created');
};
