
/**
 * Main Notifications Hook
 * 
 * Single source of truth for all notification data with smart caching
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotificationFilters, EnhancedNotification } from '../types';
import { enhanceNotification } from '../utils/formatters';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useNotifications');

export function useNotifications(filters: NotificationFilters = {}) {
  const {
    showArchived = false,
    contentTypes,
    isRead,
    limit = 50
  } = filters;

  return useQuery({
    queryKey: ['notifications', { showArchived, contentTypes, isRead, limit }],
    queryFn: async (): Promise<EnhancedNotification[]> => {
      logger.debug('Fetching notifications with filters:', filters);

      try {
        // Build the query
        let query = supabase
          .from('notifications')
          .select('*')
          .eq('is_archived', showArchived)
          .order('created_at', { ascending: false })
          .limit(limit);

        // Apply optional filters
        if (contentTypes && contentTypes.length > 0) {
          query = query.in('content_type', contentTypes);
        }

        if (typeof isRead === 'boolean') {
          query = query.eq('is_read', isRead);
        }

        const { data: notifications, error } = await query;

        if (error) {
          logger.error('Error fetching notifications:', error);
          throw error;
        }

        if (!notifications || notifications.length === 0) {
          return [];
        }

        // Get unique actor IDs for profile lookup
        const actorIds = [...new Set(
          notifications
            .map(n => n.actor_id)
            .filter(id => id !== null)
        )];

        // Fetch actor profiles in one query
        let profilesMap = new Map();
        if (actorIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .in('id', actorIds);

          if (profilesError) {
            logger.warn('Error fetching profiles:', profilesError);
          } else if (profiles) {
            profilesMap = new Map(profiles.map(p => [p.id, p]));
          }
        }

        // Enhance notifications with profile data and formatting
        const enhancedNotifications = notifications.map(notification => {
          const actorProfile = notification.actor_id 
            ? profilesMap.get(notification.actor_id) 
            : null;
          
          return enhanceNotification(notification, actorProfile);
        });

        logger.debug(`Processed ${enhancedNotifications.length} notifications`);
        return enhancedNotifications;

      } catch (error) {
        logger.error('Exception in notifications query:', error);
        throw error;
      }
    },
    // Smart caching and refresh settings
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    retry: 3
  });
}

/**
 * Hook for unread notification count
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .eq('is_archived', false);

      if (error) {
        logger.error('Error fetching unread count:', error);
        return 0;
      }

      return count || 0;
    },
    staleTime: 15 * 1000, // 15 seconds
    refetchInterval: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true
  });
}
