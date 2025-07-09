
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
import { useEffect } from 'react';

const logger = createLogger('useNotifications');

/**
 * Enhanced notifications hook with real-time updates and profile caching
 * Consolidates all notification functionality into a single efficient hook
 */
export function useNotifications() {
  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<NotificationWithProfile[]> => {
      logger.debug('Fetching notifications with profile caching');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('No authenticated user');
        return [];
      }

      // Step 1: Fetch notifications
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
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

      // Step 2: Efficient profile fetching with caching
      const actorIds = [...new Set(notifications.map(n => n.actor_id).filter(Boolean))];
      const profilesMap = new Map();
      
      if (actorIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', actorIds);

        if (!profilesError && profiles) {
          profiles.forEach(profile => {
            profilesMap.set(profile.id, {
              display_name: profile.display_name,
              avatar_url: profile.avatar_url
            });
          });
        }
      }

      // Step 3: Combine data efficiently
      const notificationsWithProfiles: NotificationWithProfile[] = notifications.map(notification => ({
        ...notification,
        profiles: notification.actor_id ? profilesMap.get(notification.actor_id) || null : null
      }));

      logger.debug(`Fetched ${notificationsWithProfiles.length} notifications`);
      return notificationsWithProfiles;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true
  });

  // Real-time updates
  useEffect(() => {
    let channel: any;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('notifications-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            query.refetch();
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [query]);

  return query;
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
 * Hook to get archived notifications
 */
export function useArchivedNotifications() {
  return useQuery({
    queryKey: ['notifications', 'archived'],
    queryFn: async (): Promise<NotificationWithProfile[]> => {
      logger.debug('Fetching archived notifications');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('No authenticated user');
        return [];
      }

      // Fetch archived notifications
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (notificationsError) {
        logger.error('Error fetching archived notifications:', notificationsError);
        throw notificationsError;
      }

      if (!notifications || notifications.length === 0) {
        logger.debug('No archived notifications found');
        return [];
      }

      // Get unique actor IDs to fetch profiles
      const actorIds = [...new Set(notifications.map(n => n.actor_id).filter(Boolean))];
      
      let profilesMap = new Map();
      
      if (actorIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', actorIds);

        if (profilesError) {
          logger.warn('Error fetching profiles for archived notifications:', profilesError);
        } else if (profiles) {
          profiles.forEach(profile => {
            profilesMap.set(profile.id, profile);
          });
        }
      }

      // Merge notifications with profile data
      const notificationsWithProfiles: NotificationWithProfile[] = notifications.map(notification => ({
        ...notification,
        profiles: notification.actor_id ? profilesMap.get(notification.actor_id) || null : null
      }));

      logger.debug(`Fetched ${notificationsWithProfiles.length} archived notifications`);
      return notificationsWithProfiles;
    },
    enabled: false, // Only fetch when explicitly requested
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Optimized notification actions with better caching
 */
export function useNotificationActions() {
  const queryClient = useQueryClient();

  const markAsRead = async (notificationId: string) => {
    // Optimistic update
    queryClient.setQueryData(['notifications'], (old: NotificationWithProfile[] = []) =>
      old.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      logger.error('Error marking as read:', error);
      throw error;
    }

    // Update unread count
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  };

  const archive = async (notificationId: string) => {
    // Optimistic update - remove from main list
    queryClient.setQueryData(['notifications'], (old: NotificationWithProfile[] = []) =>
      old.filter(n => n.id !== notificationId)
    );

    const { error } = await supabase
      .from('notifications')
      .update({ is_archived: true })
      .eq('id', notificationId);

    if (error) {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      logger.error('Error archiving:', error);
      throw error;
    }

    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: ['notifications', 'archived'] });
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Optimistic update
    queryClient.setQueryData(['notifications'], (old: NotificationWithProfile[] = []) =>
      old.map(n => ({ ...n, is_read: true }))
    );

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_archived', false);

    if (error) {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      logger.error('Error marking all as read:', error);
      throw error;
    }

    // Update unread count
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  };

  return { markAsRead, archive, markAllAsRead };
}
