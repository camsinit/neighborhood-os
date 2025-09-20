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
 * Monitor notification creation in real-time
 */
export const startNotificationMonitoring = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('notification_monitoring')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      },
      (payload) => {
        logger.debug('New notification detected:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Monitor group member changes in real-time
 */
export const startGroupMemberMonitoring = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('group_member_monitoring')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'group_members'
      },
      (payload) => {
        logger.debug('Group member change detected:', payload);
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

/**
 * Get recent notifications for debugging
 */
export const getRecentNotifications = async (userId?: string, minutes = 60) => {
  try {
    let query = supabase
      .from('notifications')
      .select(`
        id,
        user_id,
        actor_id,
        title,
        content_type,
        content_id,
        notification_type,
        action_type,
        created_at,
        metadata,
        profiles!notifications_actor_id_fkey(display_name)
      `)
      .gte('created_at', new Date(Date.now() - minutes * 60000).toISOString())
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: notifications, error } = await query;

    if (error) throw error;

    logger.debug('Recent notifications fetched:', { 
      count: notifications?.length || 0, 
      userId,
      notifications: notifications?.slice(0, 5) // Log first 5 for debugging
    });

    return notifications || [];

  } catch (error) {
    logger.error('Error fetching recent notifications:', error);
    return [];
  }
};

/**
 * Get recent group member activities for debugging
 */
export const getRecentGroupMemberActivities = async (groupId?: string, minutes = 60) => {
  try {
    let query = supabase
      .from('group_members')
      .select(`
        id,
        group_id,
        user_id,
        role,
        joined_at,
        invited_by,
        groups!inner(name, created_by, neighborhood_id),
        profiles!group_members_user_id_fkey(display_name)
      `)
      .gte('joined_at', new Date(Date.now() - minutes * 60000).toISOString())
      .order('joined_at', { ascending: false });

    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    const { data: members, error } = await query;

    if (error) throw error;

    logger.debug('Recent group member activities fetched:', { 
      count: members?.length || 0, 
      groupId,
      members: members?.slice(0, 3) // Log first 3 for debugging
    });

    return members || [];

  } catch (error) {
    logger.error('Error fetching recent group member activities:', error);
    return [];
  }
};

/**
 * Debug group join process - check if notifications and activities were created
 */
export const debugGroupJoin = async (groupId: string, userId: string) => {
  logger.info('=== DEBUGGING GROUP JOIN ===', { groupId, userId });

  try {
    // Check if the user actually joined the group
    const { data: membership } = await supabase
      .from('group_members')
      .select(`
        id,
        group_id,
        user_id,
        role,
        joined_at,
        groups!inner(name, created_by, neighborhood_id),
        profiles!group_members_user_id_fkey(display_name)
      `)
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (!membership) {
      logger.error('Group membership not found!', { groupId, userId });
      return { success: false, error: 'Membership not found' };
    }

    logger.info('✓ Group membership found:', membership);

    // Check for recent activities related to this group
    const recentActivities = await supabase
      .from('activities')
      .select('*')
      .eq('content_type', 'groups')
      .eq('content_id', groupId)
      .eq('actor_id', userId)
      .gte('created_at', new Date(Date.now() - 5 * 60000).toISOString()) // Last 5 minutes
      .order('created_at', { ascending: false });

    logger.info('Recent group activities:', {
      count: recentActivities.data?.length || 0,
      activities: recentActivities.data
    });

    // Check for recent notifications to group managers/owners
    const groupCreator = membership.groups?.created_by;
    if (groupCreator) {
      const recentNotifications = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', groupCreator)
        .eq('actor_id', userId)
        .eq('content_type', 'groups')
        .eq('content_id', groupId)
        .gte('created_at', new Date(Date.now() - 5 * 60000).toISOString()) // Last 5 minutes
        .order('created_at', { ascending: false });

      logger.info('Recent notifications to group creator:', {
        groupCreator,
        count: recentNotifications.data?.length || 0,
        notifications: recentNotifications.data
      });
    }

    return {
      success: true,
      membership,
      activityCount: recentActivities.data?.length || 0,
      activities: recentActivities.data,
      notificationCount: 0 // Will be updated when we check notifications
    };

  } catch (error) {
    logger.error('Error in debugGroupJoin:', error);
    return { success: false, error: error.message };
  }
};