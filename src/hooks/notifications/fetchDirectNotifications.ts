
/**
 * This file contains functionality to fetch direct notifications from the notifications table
 * These are notifications created by database triggers or API calls that aren't derived from content tables
 * 
 * UPDATED: Now uses direct profile queries instead of the dropped auth_users_view
 */
import { supabase } from "@/integrations/supabase/client";
import { BaseNotification } from "./types";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this module
const logger = createLogger('fetchDirectNotifications');

/**
 * Fetch direct notifications from the dedicated notifications table
 * 
 * Now uses direct profile queries instead of the dropped security definer view
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
    // First, fetch notifications without profile data
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
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
    
    if (!notifications || notifications.length === 0) {
      return [];
    }
    
    // Get unique actor IDs to fetch profile data
    const actorIds = [...new Set(notifications
      .map(n => n.actor_id)
      .filter(id => id !== null)
    )];
    
    // Fetch profile data for all actors in one query using direct table access
    let profilesMap = new Map();
    if (actorIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', actorIds);
        
      if (profilesError) {
        logger.warn('Error fetching profiles:', profilesError);
      } else if (profiles) {
        // Create a map for quick lookup
        profilesMap = new Map(profiles.map(p => [p.id, p]));
      }
    }
    
    // Process and return the notifications with profile data
    return processDirectNotifications(notifications, profilesMap);
    
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
 * @param profilesMap - Map of actor IDs to their profile data
 * @returns Processed notifications adhering to BaseNotification interface
 */
export const processDirectNotifications = (
  notifications: any[], 
  profilesMap: Map<string, any>
): BaseNotification[] => {
  // Log the raw notification data we're processing
  logger.debug('Processing notifications:', {
    count: notifications.length,
    types: notifications.map(n => n.notification_type),
    profilesAvailable: profilesMap.size
  });

  return notifications.map(notification => {
    // Get profile data from the map
    const profileData = notification.actor_id ? profilesMap.get(notification.actor_id) : null;
    
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
