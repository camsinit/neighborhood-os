
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
 * Fetch notifications with profile data in a single optimized query
 */
const fetchNotifications = async (): Promise<NotificationWithProfile[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Single query with join - more efficient than separate queries
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select(`
      *,
      profiles:actor_id (
        display_name,
        avatar_url
      )
    `)
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return notifications || [];
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
    const { data: { user } } = supabase.auth.getUser();
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
