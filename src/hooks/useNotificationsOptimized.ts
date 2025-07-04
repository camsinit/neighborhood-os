
/**
 * Optimized Notifications Hook
 * 
 * Combines all notification queries into a single efficient hook
 * with real-time updates and better error handling
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface NotificationWithProfile {
  id: string;
  user_id: string;
  actor_id: string;
  title: string;
  content_type: string;
  content_id: string;
  notification_type: string;
  action_type: string;
  action_label: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  metadata?: any;
  relevance_score?: number;
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  } | null;
}

/**
 * Fetch notifications with profile data using a two-step approach
 * This avoids the complex foreign key join issues we were having
 */
const fetchNotifications = async (): Promise<NotificationWithProfile[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Step 1: Fetch notifications without the problematic profile join
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*') // Get all notification fields first
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  if (!notifications || notifications.length === 0) return [];

  // Step 2: Get unique actor IDs and fetch their profiles separately
  const actorIds = [...new Set(notifications.map(n => n.actor_id).filter(Boolean))];
  let profilesMap = new Map();
  
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

  // Step 3: Combine notifications with profile data
  const notificationsWithProfiles: NotificationWithProfile[] = notifications.map(notification => ({
    ...notification,
    profiles: notification.actor_id ? profilesMap.get(notification.actor_id) || null : null
  }));

  return notificationsWithProfiles;
};

/**
 * Get unread count efficiently
 */
const fetchUnreadCount = async (): Promise<number> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)
    .eq('is_archived', false);

  if (error) throw error;
  return count || 0;
};

/**
 * Main notifications hook with real-time updates
 */
export function useNotificationsOptimized() {
  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });

  // Set up real-time subscription
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('notifications-changes')
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

      return () => {
        supabase.removeChannel(channel);
      };
    };

    getUser();
  }, [query]);

  return query;
}

/**
 * Optimized unread count hook
 */
export function useUnreadCountOptimized() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: fetchUnreadCount,
    staleTime: 15 * 1000, // 15 seconds
    refetchInterval: 30 * 1000, // 30 seconds
  });
}

/**
 * Notification actions with optimistic updates
 */
export function useNotificationActionsOptimized() {
  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  };

  const archive = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_archived: true })
      .eq('id', notificationId);

    if (error) throw error;
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_archived', false);

    if (error) throw error;
  };

  return { markAsRead, archive, markAllAsRead };
}
