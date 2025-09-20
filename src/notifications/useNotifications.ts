
/**
 * Neighborhood-Filtered Notifications Hook
 * 
 * React Query hook that fetches notifications filtered by current neighborhood
 * Joins with content tables to ensure only relevant neighborhood notifications are shown
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotificationWithProfile } from './types';
import { createLogger } from '@/utils/logger';
import { useEffect } from 'react';
import { useCurrentNeighborhood } from '@/hooks/useCurrentNeighborhood';

const logger = createLogger('useNotifications');

/**
 * Enhanced notifications hook with neighborhood filtering and real-time updates
 * Filters notifications to show only those related to content from the current neighborhood
 */
export function useNotifications() {
  const currentNeighborhood = useCurrentNeighborhood();
  
  const query = useQuery({
    queryKey: ['notifications', currentNeighborhood?.id],
    queryFn: async (): Promise<NotificationWithProfile[]> => {
      logger.debug('Fetching neighborhood-filtered notifications with profile caching');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('No authenticated user');
        return [];
      }

      // If no neighborhood is selected, return empty array
      if (!currentNeighborhood?.id) {
        logger.debug('No current neighborhood, returning empty notifications');
        return [];
      }

      // Step 1: Fetch notifications filtered by neighborhood
      // We need to join with content tables to filter by their neighborhood_id
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select(`
          *,
          events!inner(neighborhood_id),
          safety_updates!inner(neighborhood_id),
          skills_exchange!inner(neighborhood_id),
          goods_exchange!inner(neighborhood_id),
          group_updates!inner(groups!inner(neighborhood_id))
        `)
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .or(`events.neighborhood_id.eq.${currentNeighborhood.id},safety_updates.neighborhood_id.eq.${currentNeighborhood.id},skills_exchange.neighborhood_id.eq.${currentNeighborhood.id},goods_exchange.neighborhood_id.eq.${currentNeighborhood.id},group_updates.groups.neighborhood_id.eq.${currentNeighborhood.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      // If the complex join fails, fallback to basic notification fetch
      if (notificationsError) {
        logger.warn('Complex join failed, falling back to basic fetch:', notificationsError);
        
        const { data: basicNotifications, error: basicError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_archived', false)
          .order('created_at', { ascending: false })
          .limit(50);

        if (basicError) {
          logger.error('Error fetching notifications:', basicError);
          throw basicError;
        }

        // For fallback, we'll filter notifications manually by checking content
        const filteredNotifications = await filterNotificationsByNeighborhood(
          basicNotifications || [], 
          currentNeighborhood.id
        );
        
        return await enrichWithProfiles(filteredNotifications);
      }

      if (!notifications || notifications.length === 0) {
        logger.debug('No neighborhood-filtered notifications found');
        return [];
      }

      return await enrichWithProfiles(notifications);
    },
    enabled: !!currentNeighborhood?.id, // Only fetch when neighborhood is available
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true
  });

  // Real-time updates with neighborhood context
  useEffect(() => {
    let channel: any;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !currentNeighborhood?.id) return;

      channel = supabase
        .channel(`notifications-realtime-${currentNeighborhood.id}`)
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
  }, [query, currentNeighborhood?.id]);

  return query;
}

/**
 * Helper function to filter notifications by neighborhood based on content associations
 */
async function filterNotificationsByNeighborhood(
  notifications: any[],
  neighborhoodId: string
): Promise<any[]> {
  if (!notifications.length) return [];

  const contentTypeQueries = [];
  const contentIds = {
    events: [],
    safety: [],
    skills: [],
    goods: [],
    group_updates: []
  };

  // Group content IDs by type
  for (const notification of notifications) {
    switch (notification.content_type) {
      case 'events':
        contentIds.events.push(notification.content_id);
        break;
      case 'safety':
      case 'safety_updates':
        contentIds.safety.push(notification.content_id);
        break;
      case 'skills':
      case 'skills_exchange':
        contentIds.skills.push(notification.content_id);
        break;
      case 'goods':
      case 'goods_exchange':
        contentIds.goods.push(notification.content_id);
        break;
      case 'group_updates':
        contentIds.group_updates.push(notification.content_id);
        break;
    }
  }

  // Query each content type for neighborhood associations
  const validContentIds = new Set();

  if (contentIds.events.length > 0) {
    const { data } = await supabase
      .from('events')
      .select('id')
      .in('id', contentIds.events)
      .eq('neighborhood_id', neighborhoodId);
    data?.forEach(item => validContentIds.add(item.id));
  }

  if (contentIds.safety.length > 0) {
    const { data } = await supabase
      .from('safety_updates')
      .select('id')
      .in('id', contentIds.safety)
      .eq('neighborhood_id', neighborhoodId);
    data?.forEach(item => validContentIds.add(item.id));
  }

  if (contentIds.skills.length > 0) {
    const { data } = await supabase
      .from('skills_exchange')
      .select('id')
      .in('id', contentIds.skills)
      .eq('neighborhood_id', neighborhoodId);
    data?.forEach(item => validContentIds.add(item.id));
  }

  if (contentIds.goods.length > 0) {
    const { data } = await supabase
      .from('goods_exchange')
      .select('id')
      .in('id', contentIds.goods)
      .eq('neighborhood_id', neighborhoodId);
    data?.forEach(item => validContentIds.add(item.id));
  }

  if (contentIds.group_updates.length > 0) {
    const { data } = await supabase
      .from('group_updates')
      .select('id, groups!inner(neighborhood_id)')
      .in('id', contentIds.group_updates)
      .eq('groups.neighborhood_id', neighborhoodId);
    data?.forEach(item => validContentIds.add(item.id));
  }

  // Filter notifications to only include those with valid content IDs
  return notifications.filter(notification => 
    validContentIds.has(notification.content_id)
  );
}

/**
 * Helper function to enrich notifications with profile data
 */
async function enrichWithProfiles(notifications: any[]): Promise<NotificationWithProfile[]> {
  if (!notifications.length) return [];

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

  logger.debug(`Enriched ${notificationsWithProfiles.length} notifications with profiles`);
  return notificationsWithProfiles;
}

/**
 * Hook to get unread notification count filtered by current neighborhood
 */
export function useUnreadCount() {
  const currentNeighborhood = useCurrentNeighborhood();
  
  return useQuery({
    queryKey: ['notifications', 'unread-count', currentNeighborhood?.id],
    queryFn: async (): Promise<number> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !currentNeighborhood?.id) return 0;

      // Get all unread notifications and filter by neighborhood
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('content_type, content_id')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .eq('is_archived', false);

      if (error) {
        logger.error('Error fetching unread notifications:', error);
        return 0;
      }

      if (!notifications?.length) return 0;

      // Filter by neighborhood using the same logic as main notifications
      const filteredNotifications = await filterNotificationsByNeighborhood(
        notifications,
        currentNeighborhood.id
      );

      return filteredNotifications.length;
    },
    enabled: !!currentNeighborhood?.id,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000
  });
}

/**
 * Hook to get archived notifications filtered by current neighborhood
 */
export function useArchivedNotifications() {
  const currentNeighborhood = useCurrentNeighborhood();
  
  return useQuery({
    queryKey: ['notifications', 'archived', currentNeighborhood?.id],
    queryFn: async (): Promise<NotificationWithProfile[]> => {
      logger.debug('Fetching neighborhood-filtered archived notifications');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !currentNeighborhood?.id) {
        logger.warn('No authenticated user or neighborhood');
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

      // Filter by neighborhood
      const filteredNotifications = await filterNotificationsByNeighborhood(
        notifications,
        currentNeighborhood.id
      );

      return await enrichWithProfiles(filteredNotifications);
    },
    enabled: false, // Only fetch when explicitly requested
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Optimized notification actions with neighborhood-aware caching
 */
export function useNotificationActions() {
  const queryClient = useQueryClient();
  const currentNeighborhood = useCurrentNeighborhood();

  const markAsRead = async (notificationId: string) => {
    // Optimistic update for current neighborhood
    queryClient.setQueryData(['notifications', currentNeighborhood?.id], (old: NotificationWithProfile[] = []) =>
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

    // Update unread count for current neighborhood
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count', currentNeighborhood?.id] });
  };

  const archive = async (notificationId: string) => {
    // Optimistic update - remove from main list for current neighborhood
    queryClient.setQueryData(['notifications', currentNeighborhood?.id], (old: NotificationWithProfile[] = []) =>
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

    // Invalidate related queries for current neighborhood
    queryClient.invalidateQueries({ queryKey: ['notifications', 'archived', currentNeighborhood?.id] });
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count', currentNeighborhood?.id] });
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Optimistic update for current neighborhood
    queryClient.setQueryData(['notifications', currentNeighborhood?.id], (old: NotificationWithProfile[] = []) =>
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

    // Update unread count for current neighborhood
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count', currentNeighborhood?.id] });
  };

  return { markAsRead, archive, markAllAsRead };
}
