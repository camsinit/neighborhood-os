
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
 */
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<NotificationWithProfile[]> => {
      logger.debug('Fetching notifications');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('No authenticated user');
        return [];
      }

      // Fetch notifications with profile data in one query
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles:actor_id(*)
        `)
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        logger.error('Error fetching notifications:', error);
        throw error;
      }

      logger.debug(`Fetched ${notifications?.length || 0} notifications`);
      return notifications || [];
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
