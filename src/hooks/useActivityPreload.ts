import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentNeighborhood } from '@/hooks/useCurrentNeighborhood';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useActivityPreload');

/**
 * useActivityPreload Hook
 * 
 * Pre-loads neighborhood activity data during onboarding to ensure
 * the activity feed is ready when new neighbors complete their setup.
 * This prevents the loading delay they would otherwise experience.
 */
export const useActivityPreload = (shouldPreload: boolean = false) => {
  const queryClient = useQueryClient();
  const neighborhood = useCurrentNeighborhood();

  // Pre-load activities when shouldPreload is true
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', neighborhood?.id],
    queryFn: async () => {
      if (!neighborhood?.id) {
        logger.warn('No neighborhood ID available for activity preload');
        return [];
      }

      logger.info('Pre-loading activities for neighborhood:', neighborhood.id);

      // Fetch recent activities (last 30 days worth)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          profiles!activities_actor_id_fkey (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('neighborhood_id', neighborhood.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(20); // Get the 20 most recent activities

      if (error) {
        logger.error('Error pre-loading activities:', error);
        throw error;
      }

      logger.info(`Successfully pre-loaded ${data?.length || 0} activities`);
      return data || [];
    },
    enabled: shouldPreload && !!neighborhood?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Pre-load other related data that might be needed
  useEffect(() => {
    if (shouldPreload && neighborhood?.id) {
      logger.info('Pre-loading additional neighborhood data');

      // Pre-load neighbors list
      queryClient.prefetchQuery({
        queryKey: ['neighborhood-members', neighborhood.id],
        queryFn: async () => {
          const { data } = await supabase
            .from('neighborhood_members')
            .select(`
              *,
              profiles!neighborhood_members_user_id_fkey (
                id,
                display_name,
                avatar_url
              )
            `)
            .eq('neighborhood_id', neighborhood.id)
            .eq('status', 'active');
          
          return data || [];
        },
        staleTime: 1000 * 60 * 5,
      });

      // Pre-load recent events  
      queryClient.prefetchQuery({
        queryKey: ['events', neighborhood.id],
        queryFn: async () => {
          const { data } = await supabase
            .from('events')
            .select('*')
            .eq('neighborhood_id', neighborhood.id)
            .gte('time', new Date().toISOString())
            .order('time', { ascending: true })
            .limit(10);
          
          return data || [];
        },
        staleTime: 1000 * 60 * 5,
      });
    }
  }, [shouldPreload, neighborhood?.id, queryClient]);

  return {
    activities,
    isLoading,
    isPreloaded: !isLoading && activities !== undefined,
  };
};