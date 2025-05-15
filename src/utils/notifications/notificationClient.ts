
/**
 * notificationClient.ts
 * 
 * A unified client for interacting with the notifications system.
 * This provides a clean API for all notification-related operations.
 */
import { supabase } from "@/integrations/supabase/client";
import { BaseNotification } from "@/hooks/notifications/types";
import { createLogger } from "@/utils/logger";
import { toast } from "sonner";
import { refreshEvents } from "@/utils/refreshEvents";

// Create a dedicated logger for this module
const logger = createLogger('notificationClient');

/**
 * Unified Notification Client
 * 
 * This client handles all API interactions for notifications
 * and provides consistent error handling.
 */
export const notificationClient = {
  /**
   * Fetch all notifications for the current user
   * 
   * @param showArchived - Whether to include archived notifications
   * @returns Promise resolving to array of notifications
   */
  async fetchNotifications(showArchived: boolean = false): Promise<BaseNotification[]> {
    try {
      // Get the current user
      const { data: user } = await supabase.auth.getUser();
      const userId = user.user?.id;
      
      if (!userId) {
        logger.debug('No user authenticated, returning empty notifications array');
        return [];
      }
      
      // Fetch notifications with a more reliable query
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles:actor_id(display_name, avatar_url)
        `)
        .eq('user_id', userId)
        .eq('is_archived', showArchived)
        .order('created_at', { ascending: false });
        
      if (error) {
        logger.error('Error fetching notifications:', error);
        return [];
      }
      
      // Process notifications to standardize format
      return this.processNotifications(data || []);
    } catch (error) {
      logger.error('Exception in fetchNotifications:', error);
      return [];
    }
  },
  
  /**
   * Mark a notification as read
   * 
   * @param notificationType - Type of notification (for analytics)
   * @param notificationId - ID of notification to mark as read
   * @returns Promise resolving to success boolean
   */
  async markAsRead(notificationType: string, notificationId: string): Promise<boolean> {
    try {
      logger.debug(`Marking ${notificationType} notification ${notificationId} as read`);
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
        
      if (error) {
        logger.error('Error marking notification as read:', error);
        return false;
      }
      
      // Trigger refresh event
      refreshEvents.emit('notification-read');
      
      return true;
    } catch (error) {
      logger.error('Exception in markAsRead:', error);
      return false;
    }
  },
  
  /**
   * Archive a notification
   * 
   * @param notificationId - ID of notification to archive
   * @returns Promise resolving to success boolean
   */
  async archiveNotification(notificationId: string): Promise<boolean> {
    try {
      logger.debug(`Archiving notification ${notificationId}`);
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_archived: true })
        .eq('id', notificationId);
        
      if (error) {
        logger.error('Error archiving notification:', error);
        toast({
          title: "Couldn't archive notification",
          description: "Please try again later",
          variant: "destructive",
        });
        return false;
      }
      
      // Trigger refresh event
      refreshEvents.emit('notification-archived');
      
      return true;
    } catch (error) {
      logger.error('Exception in archiveNotification:', error);
      toast({
        title: "Couldn't archive notification",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  },
  
  /**
   * Mark all notifications as read for the current user
   * 
   * @returns Promise resolving to success boolean
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      logger.debug('Marking all notifications as read');
      
      // Get current user
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        logger.error('No authenticated user found');
        return false;
      }
      
      // Update all unread notifications for this user
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.user.id)
        .eq('is_read', false);
        
      if (error) {
        logger.error('Error marking all as read:', error);
        toast({
          title: "Couldn't update notifications",
          description: "Please try again later",
          variant: "destructive",
        });
        return false;
      }
      
      // Trigger refresh event
      refreshEvents.emit('notifications-all-read');
      
      return true;
    } catch (error) {
      logger.error('Exception in markAllAsRead:', error);
      toast({
        title: "Couldn't update notifications",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  },
  
  /**
   * Get unread notification count
   * 
   * @returns Promise resolving to number of unread notifications
   */
  async getUnreadCount(): Promise<number> {
    try {
      // Get current user
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        return 0;
      }
      
      // Use count query for efficiency
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
      logger.error('Exception in getUnreadCount:', error);
      return 0;
    }
  },
  
  /**
   * Process raw notifications to standardize format
   * 
   * @private
   * @param notifications - Raw notifications from database
   * @returns Processed notifications
   */
  processNotifications(notifications: any[]): BaseNotification[] {
    return notifications.map(notification => {
      // Extract profile data if available
      const actorProfile = notification.profiles || {};
      
      // Build context object from metadata
      const context = {
        contextType: notification.notification_type || 'general',
        neighborName: actorProfile.display_name || "A neighbor",
        avatarUrl: actorProfile.avatar_url || null,
        ...(notification.metadata || {})
      };
      
      // Return standardized notification
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
        context,
        description: notification.description || null,
        profiles: notification.profiles || null
      };
    });
  }
};

// Export default for easy imports
export default notificationClient;
