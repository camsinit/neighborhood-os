
/**
 * This file contains functionality to fetch direct notifications from the notifications table
 * These are notifications created by database triggers or API calls that aren't derived from content tables
 */
import { supabase } from "@/integrations/supabase/client";
import { BaseNotification } from "./types";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this module
const logger = createLogger('fetchDirectNotifications');

/**
 * Fetch direct notifications from the dedicated notifications table
 * 
 * @param showArchived - Whether to include archived notifications
 * @returns Formatted array of notifications
 */
export const fetchDirectNotifications = async (showArchived: boolean): Promise<BaseNotification[]> => {
  // Get the current user - we need their ID to fetch their notifications
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  
  // If no user is authenticated, return empty array
  if (!userId) {
    logger.debug('No user ID found, returning empty notifications');
    return [];
  }

  // Log the query parameters for debugging
  logger.debug('Fetching direct notifications with params:', {
    userId,
    showArchived,
    timestamp: new Date().toISOString()
  });
  
  try {
    // FIXED: Using a more reliable query without problematic joins that might fail
    // This query fetches notifications first, then separately fetches profiles
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', showArchived)
      .order('created_at', { ascending: false });
      
    if (error) {
      logger.error('Error fetching notifications:', error);
      return [];
    }
    
    // Log the raw notifications count
    logger.debug(`Found ${notifications?.length || 0} direct notifications`);
    
    // If we have notifications, fetch actor profiles separately
    // This prevents join errors when profiles are missing
    if (notifications && notifications.length > 0) {
      // Collect unique actor IDs for profile lookup
      const actorIds = notifications
        .map(n => n.actor_id)
        .filter((id): id is string => !!id); // Filter out undefined/null
      
      // Only fetch profiles if we have actor IDs
      if (actorIds.length > 0) {
        const uniqueActorIds = [...new Set(actorIds)]; // Remove duplicates
        
        logger.debug(`Fetching profiles for ${uniqueActorIds.length} actors`);
        
        // Fetch profiles separately
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', uniqueActorIds);
          
        if (profileError) {
          logger.error('Error fetching actor profiles:', profileError);
        } else {
          // Create a map for quick profile lookup
          const profilesMap = new Map();
          profiles?.forEach(profile => {
            if (profile && profile.id) {
              profilesMap.set(profile.id, profile);
            }
          });
          
          // Attach profiles to notifications
          for (const notification of notifications) {
            if (notification.actor_id && profilesMap.has(notification.actor_id)) {
              // FIX: TypeScript doesn't know about our profiles field, so we need to add it properly
              (notification as any).profiles = profilesMap.get(notification.actor_id);
            }
          }
          
          logger.debug(`Successfully attached profiles to notifications`);
        }
      }
    }
    
    // Process and return the notifications with profiles attached
    return processDirectNotifications(notifications || []);
    
  } catch (error: any) {
    // Improved error handling with detailed logging
    logger.error('Unexpected error in fetchDirectNotifications:', {
      error: error.message,
      stack: error.stack,
      userId
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
    // FIX: Use optional chaining to safely access profiles
    const actorProfile = (notification as any).profiles || {};
    
    // Build a standardized context object from metadata
    const notificationContext = {
      contextType: notification.notification_type || 'general',
      neighborName: actorProfile.display_name || "A neighbor",
      avatarUrl: actorProfile.avatar_url || null,
      ...(notification.metadata || {})
    };
    
    // Log individual notification processing for debugging
    logger.debug(`Processing notification ${notification.id}:`, {
      title: notification.title,
      actor: notification.actor_id,
      hasProfile: !!(notification as any).profiles,
      contentType: notification.content_type,
      context: notificationContext
    });
    
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
      profiles: (notification as any).profiles || null
    };
  });
};
