
/**
 * This file contains functionality to fetch direct notifications from the notifications table
 * These are notifications created by database triggers or API calls that aren't derived from content tables
 * 
 * UPDATED: Now works with clean RLS policies - much simpler!
 */
import { supabase } from "@/integrations/supabase/client";
import { BaseNotification } from "./types";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this module
const logger = createLogger('fetchDirectNotifications');

/**
 * Fetch direct notifications from the dedicated notifications table
 * 
 * With our new clean RLS, this is much simpler - just query notifications
 * and the RLS policy handles access control automatically
 * 
 * @param showArchived - Whether to include archived notifications
 * @returns Formatted array of notifications
 */
export const fetchDirectNotifications = async (showArchived: boolean): Promise<BaseNotification[]> => {
  // Log the query parameters for debugging
  logger.debug('Fetching direct notifications with params:', {
    showArchived,
    timestamp: new Date().toISOString()
  });
  
  try {
    // SIMPLIFIED: With clean RLS, we can just query directly
    // The RLS policy "users_own_notifications" handles access control
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select(`
        *,
        profiles:actor_id(id, display_name, avatar_url)
      `)
      .eq('is_archived', showArchived)
      .order('created_at', { ascending: false });
      
    if (error) {
      logger.error('Error fetching notifications:', error);
      return [];
    }
    
    // Log the raw notifications count
    logger.debug(`Found ${notifications?.length || 0} direct notifications`);
    
    // Process and return the notifications
    return processDirectNotifications(notifications || []);
    
  } catch (error: any) {
    // Improved error handling with detailed logging
    logger.error('Unexpected error in fetchDirectNotifications:', {
      error: error.message,
      stack: error.stack
    });
    return [];
  }
};

/**
 * Process raw notifications from the notifications table to match the BaseNotification format
 * 
 * @param notifications - Raw notifications from the database
 * @returns Processed notifications adhering to BaseNotification interface
 */
export const processDirectNotifications = (notifications: any[]): BaseNotification[] => {
  // Log the raw notification data we're processing
  logger.debug('Processing notifications:', {
    count: notifications.length,
    types: notifications.map(n => n.notification_type)
  });

  return notifications.map(notification => {
    // Extract profile data if available, provide fallbacks if not
    const actorProfile = notification.profiles || {};
    
    // Build a standardized context object from metadata
    const notificationContext = {
      contextType: notification.notification_type || 'general',
      neighborName: actorProfile.display_name || "A neighbor",
      avatarUrl: actorProfile.avatar_url || null,
      ...(notification.metadata || {})
    };
    
    // Return a properly formatted BaseNotification
    return {
      id: notification.id,
      user_id: notification.user_id,
      title: notification.title || "New notification",
      actor_id: notification.actor_id,
      content_type: notification.content_type || "general",
      content_id: notification.content_id,
      notification_type: notification.notification_type || "general",
      action_type: notification.action_type || 'view',
      action_label: notification.action_label || 'View',
      is_read: notification.is_read || false,
      is_archived: notification.is_archived || false,
      created_at: notification.created_at,
      updated_at: notification.updated_at || notification.created_at,
      context: notificationContext,
      // Include additional fields for consistency with other notification types
      description: notification.description || null,
      profiles: notification.profiles || null
    };
  });
};
