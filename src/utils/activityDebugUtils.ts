
/**
 * Utility functions for debugging activity creation issues
 */
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('activityDebugUtils');

/**
 * Get detailed information about database triggers
 */
export const getDatabaseTriggers = async () => {
  try {
    const { data, error } = await supabase.rpc('sql', {
      query: `
        SELECT 
          t.tgname as trigger_name,
          c.relname as table_name,
          p.proname as function_name,
          t.tgenabled as is_enabled,
          CASE t.tgtype
            WHEN 1 THEN 'BEFORE'
            WHEN 2 THEN 'AFTER'
            WHEN 5 THEN 'INSTEAD OF'
            ELSE 'OTHER'
          END as trigger_timing,
          CASE 
            WHEN t.tgtype & 4 > 0 THEN 'INSERT'
            WHEN t.tgtype & 8 > 0 THEN 'DELETE'
            WHEN t.tgtype & 16 > 0 THEN 'UPDATE'
            ELSE 'OTHER'
          END as trigger_event
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_proc p ON t.tgfoid = p.oid
        WHERE c.relname IN ('safety_updates', 'events', 'goods_exchange', 'skills_exchange', 'event_rsvps')
        AND t.tgname LIKE '%activity%'
        ORDER BY c.relname, t.tgname;
      `
    });

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error fetching trigger info:', error);
    return null;
  }
};

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
