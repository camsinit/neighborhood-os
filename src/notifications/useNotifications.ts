
/**
 * Single Notifications Hook
 * 
 * Simple React Query hook that fetches notifications directly from Supabase
 * No complex transformations - the backend templates already provide perfect content
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotificationWithProfile } from './types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useNotifications');

/**
 * Hook to fetch all notifications for the current user
 * Uses a simplified approach: fetch notifications first, then fetch profiles separately
 * This avoids complex foreign key joins that were causing type errors
 */
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<NotificationWithProfile[]> => {
      logger.debug('Fetching notifications with simplified approach');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('No authenticated user');
        return [];
      }

      // Step 1: Fetch notifications without the problematic join
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*') // Just get all notification fields
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (notificationsError) {
        logger.error('Error fetching notifications:', notificationsError);
        throw notificationsError;
      }

      if (!notifications || notifications.length === 0) {
        logger.debug('No notifications found');
        return [];
      }

      // Step 2: Get unique actor IDs to fetch profiles
      const actorIds = [...new Set(notifications.map(n => n.actor_id).filter(Boolean))];
      
      let profilesMap = new Map();
      
      if (actorIds.length > 0) {
        // Fetch profiles for all actors
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', actorIds);

        if (profilesError) {
          logger.warn('Error fetching profiles, continuing without profile data:', profilesError);
        } else if (profiles) {
          // Create a map for quick lookup
          profiles.forEach(profile => {
            profilesMap.set(profile.id, profile);
          });
        }
      }

      // Step 3: Merge notifications with profile data
      const notificationsWithProfiles: NotificationWithProfile[] = notifications.map(notification => ({
        ...notification,
        profiles: notification.actor_id ? profilesMap.get(notification.actor_id) || null : null
      }));

      logger.debug(`Fetched ${notificationsWithProfiles.length} notifications with profile data`);
      return notificationsWithProfiles;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true
  });
}

/**
 * Hook to get unread notification count
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async (): Promise<number> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .eq('is_archived', false);

      if (error) {
        logger.error('Error fetching unread count:', error);
        return 0;
      }

      return count || 0;
    },
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000
  });
}

/**
 * Actions for notifications
 */
export function useNotificationActions() {
  const queryClient = useQueryClient();

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      logger.error('Error marking as read:', error);
      throw error;
    }

    // Refresh cache
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const archive = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_archived: true })
      .eq('id', notificationId);

    if (error) {
      logger.error('Error archiving:', error);
      throw error;
    }

    // Refresh cache
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_archived', false);

    if (error) {
      logger.error('Error marking all as read:', error);
      throw error;
    }

    // Refresh cache
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return { markAsRead, archive, markAllAsRead };
}
