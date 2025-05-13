
/**
 * Utility functions to help debug notification issues
 */
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";

const logger = createLogger('debugNotifications');

/**
 * Check for RSVP notifications for a specific host
 * 
 * @param hostId - The UUID of the host/event creator
 * @returns The notifications found
 */
export const checkRsvpNotificationsForHost = async (hostId: string) => {
  logger.info(`Checking RSVP notifications for host: ${hostId}`);
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', hostId)
    .eq('notification_type', 'event')
    .order('created_at', { ascending: false });
  
  if (error) {
    logger.error('Error fetching RSVP notifications:', error);
    return { success: false, error };
  }
  
  logger.info(`Found ${data?.length || 0} notifications for host ${hostId}`);
  return { success: true, data };
};

/**
 * List all notifications for a user
 * 
 * @param userId - The UUID of the user
 * @returns All notifications for the user
 */
export const listAllNotificationsForUser = async (userId: string) => {
  logger.info(`Listing all notifications for user: ${userId}`);
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    logger.error('Error fetching notifications:', error);
    return { success: false, error };
  }
  
  logger.info(`Found ${data?.length || 0} notifications for user ${userId}`);
  return { success: true, data };
};

/**
 * Verify RSVP creation by checking event_rsvps table
 * 
 * @param eventId - The event ID
 * @param userId - The user who RSVP'd
 * @returns The RSVP record if found
 */
export const verifyRsvpRecord = async (eventId: string, userId: string) => {
  logger.info(`Verifying RSVP record for event: ${eventId}, user: ${userId}`);
  
  const { data, error } = await supabase
    .from('event_rsvps')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', userId);
  
  if (error) {
    logger.error('Error fetching RSVP record:', error);
    return { success: false, error };
  }
  
  const found = data && data.length > 0;
  logger.info(`RSVP record found: ${found}`);
  return { success: true, found, data };
};

/**
 * Create a test notification
 * 
 * @param userId - The user to create the notification for
 * @param actorId - The user who performed the action
 * @returns Result of the notification creation
 */
export const createTestNotification = async (userId: string, actorId: string) => {
  logger.info(`Creating test notification for user: ${userId}, from: ${actorId}`);
  
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      actor_id: actorId,
      title: 'Test Notification',
      content_type: 'events',
      content_id: '00000000-0000-0000-0000-000000000000', // Dummy ID
      notification_type: 'event',
      action_type: 'view',
      action_label: 'View Test',
      metadata: { test: true }
    })
    .select();
  
  if (error) {
    logger.error('Error creating test notification:', error);
    return { success: false, error };
  }
  
  logger.info('Test notification created successfully');
  return { success: true, data };
};
