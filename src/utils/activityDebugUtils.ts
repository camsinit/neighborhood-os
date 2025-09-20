
/**
 * Utility functions for debugging activity creation issues
 */
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('activityDebugUtils');

/**
 * Monitor activity creation in real-time
 */
export const startActivityMonitoring = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('activity_monitoring')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activities'
      },
      (payload) => {
        logger.debug('New activity detected:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Get recent activities with duplicate analysis
 */
export const getRecentActivitiesWithDuplicates = async (minutes = 60) => {
  try {
    const { data: activities, error } = await supabase
      .from('activities')
      .select(`
        id,
        actor_id,
        activity_type,
        content_id,
        content_type,
        title,
        neighborhood_id,
        created_at,
        metadata
      `)
      .gte('created_at', new Date(Date.now() - minutes * 60000).toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by content to find duplicates
    const grouped = activities?.reduce((acc: any, activity) => {
      const key = `${activity.content_type}_${activity.content_id}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(activity);
      return acc;
    }, {}) || {};

    const duplicates = Object.entries(grouped)
      .filter(([_, activities]: [string, any]) => activities.length > 1)
      .map(([key, activities]: [string, any]) => ({
        key,
        count: activities.length,
        activities: activities.sort((a: any, b: any) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      }));

    return {
      activities: activities || [],
      duplicates,
      hasDuplicates: duplicates.length > 0
    };

  } catch (error) {
    logger.error('Error fetching activities with duplicates:', error);
    return { activities: [], duplicates: [], hasDuplicates: false };
  }
};
