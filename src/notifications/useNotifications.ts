
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
import { 
  buildJoinClause, 
  buildOrCondition, 
  getContentTypeConfig, 
  getSupportedContentTypes 
} from './contentTypeConfig';

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

      // Step 1: Fetch notifications filtered by neighborhood using dynamic config
      const joinClause = buildJoinClause();
      const orCondition = buildOrCondition(currentNeighborhood.id);

      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select(`*,${joinClause}`)
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .or(orCondition)
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
  // Group content IDs by type using dynamic config
  const contentIds: Record<string, string[]> = {};
  getSupportedContentTypes().forEach(type => {
    contentIds[type] = [];
  });

  // Group content IDs by type
  for (const notification of notifications) {
    const contentType = notification.content_type;
    if (contentIds[contentType]) {
      contentIds[contentType].push(notification.content_id);
    }
  }

  // Query each content type for neighborhood associations using dynamic config
  const validContentIds = new Set();

  for (const contentType of getSupportedContentTypes()) {
    const ids = contentIds[contentType];
    const config = getContentTypeConfig(contentType);
    
    if (ids && ids.length > 0 && config) {
      let query = supabase
        .from(config.table as any)
        .select('id' + (config.join ? `, ${config.join}` : ''))
        .in('id', ids);

      // Handle different neighborhood key patterns
      if (config.neighborhoodKey.includes('.')) {
        // For nested keys like 'groups.neighborhood_id'
        const [table, key] = config.neighborhoodKey.split('.');
        query = query.eq(`${table}.${key}`, neighborhoodId);
      } else {
        // For direct keys like 'neighborhood_id'
        query = query.eq(config.neighborhoodKey, neighborhoodId);
      }

      const { data } = await query;
      data?.forEach((item: any) => validContentIds.add(item.id));
    }
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
