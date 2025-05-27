
/**
 * This file contains functionality to fetch direct notifications from the notifications table
 * These are notifications created by database triggers or API calls that aren't derived from content tables
 * 
 * UPDATED: Now properly fetches profile data for actor names and avatars
 */
import { supabase } from "@/integrations/supabase/client";
import { BaseNotification } from "./types";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this module
const logger = createLogger('fetchDirectNotifications');

/**
 * Fetch direct notifications from the dedicated notifications table
 * 
 * Now includes proper profile data fetching for actor names and avatars
 * 
 * @param showArchived - Whether to include archived notifications
 * @returns Formatted array of notifications with proper profile data
 */
export const fetchDirectNotifications = async (showArchived: boolean): Promise<BaseNotification[]> => {
  // Log the query parameters for debugging
  logger.debug('Fetching direct notifications with params:', {
    showArchived,
    timestamp: new Date().toISOString()
  });
  
  try {
    // UPDATED: Now join with profiles table to get actor profile data
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select(`
        *,
        profiles:actor_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('is_archived', showArchived)
      .order('created_at', { ascending: false });
      
    if (error) {
      logger.error('Error fetching notifications:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
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
 * @param notifications - Raw notifications from the database with profile data
 * @returns Processed notifications adhering to BaseNotification interface
 */
export const processDirectNotifications = (notifications: any[]): BaseNotification[] => {
  // Log the raw notification data we're processing
  logger.debug('Processing notifications:', {
    count: notifications.length,
    types: notifications.map(n => n.notification_type)
  });

  return notifications.map(notification => {
    // Extract profile data from the joined profiles table
    const profileData = notification.profiles;
    
    // Build a standardized context object from metadata with real profile data
    const notificationContext = {
      contextType: notification.notification_type || 'general',
      neighborName: profileData?.display_name || "A neighbor", // Use actual display name
      avatarUrl: profileData?.avatar_url || null, // Use actual avatar URL
      ...(notification.metadata || {})
    };
    
    // Return a properly formatted BaseNotification with real profile data
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
      // Include the actual profile data for proper display
      description: notification.description || null,
      profiles: profileData ? {
        id: profileData.id,
        display_name: profileData.display_name,
        avatar_url: profileData.avatar_url
      } : null
    };
  });
};
