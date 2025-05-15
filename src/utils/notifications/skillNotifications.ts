
/**
 * skillNotifications.ts
 * 
 * Helper utility for triggering UI refreshes after skill-related database events
 * No direct notification creation - all notifications are created by database triggers
 */
import { refreshEvents } from "@/utils/refreshEvents";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this module
const logger = createLogger('skillNotifications');

/**
 * Signal that a skill has been requested
 * Refreshes UI components after database triggers create notifications
 * 
 * @param skillTitle - Title of the skill (for logging only)
 */
export const sendSkillRequestNotification = async (
  skillTitle: string
): Promise<void> => {
  logger.debug(`Skill request for ${skillTitle} - DB trigger will handle notification`);
  refreshEvents.emit('skills-updated');
  refreshEvents.emit('notification-created');
};

/**
 * Signal that a skill session has been confirmed
 * Refreshes UI components after database triggers create notifications
 * 
 * @param skillTitle - Title of the skill (for logging only)
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
 * Refreshes UI components after database triggers create notifications
 * 
 * @param skillTitle - Title of the skill (for logging only)
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
 * Refreshes UI components after database triggers create notifications
 * 
 * @param skillTitle - Title of the skill (for logging only)
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
 * Refreshes UI components after database triggers create notifications
 * 
 * @param skillTitle - Title of the skill (for logging only)
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
 * Refreshes UI components after database triggers create notifications
 * 
 * @param skillTitle - Title of the skill (for logging only)
 */
export const sendSkillUpdateNotification = async (
  skillTitle: string
): Promise<void> => {
  logger.debug(`Skill update for ${skillTitle} - DB trigger will handle notification`);
  refreshEvents.emit('skills-updated');
  refreshEvents.emit('notification-created');
};
