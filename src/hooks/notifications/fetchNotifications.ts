
/**
 * Main function to fetch all notifications from various sources
 */
import { BaseNotification } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { fetchDirectNotifications } from "./fetchDirectNotifications";
import { createLogger } from "@/utils/logger";

const logger = createLogger('fetchNotifications');

/**
 * Fetches safety notifications from the database
 * @param showArchived - Whether to include archived notifications
 */
export const fetchSafetyNotifications = async (showArchived: boolean) => {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  
  if (!userId) return { data: [], error: null };
  
  return await supabase
    .from('safety_updates')
    .select(`
      *,
      profiles:author_id (
        display_name,
        avatar_url
      )
    `)
    .eq('is_archived', showArchived)
    .eq('author_id', userId);
};

/**
 * Fetches event notifications from the database
 * @param showArchived - Whether to include archived notifications
 */
export const fetchEventNotifications = async (showArchived: boolean) => {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  
  if (!userId) return { data: [], error: null };
  
  return await supabase
    .from('events')
    .select(`
      *,
      profiles:host_id (
        display_name,
        avatar_url
      )
    `)
    .eq('is_archived', showArchived)
    .eq('host_id', userId);
};

/**
 * Fetches support notifications from the database
 * @param showArchived - Whether to include archived notifications
 */
export const fetchSupportNotifications = async (showArchived: boolean) => {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  
  if (!userId) return { data: [], error: null };
  
  return await supabase
    .from('support_requests')
    .select(`*`)
    .eq('is_archived', showArchived)
    .eq('user_id', userId);
};

/**
 * Fetches goods notifications from the database
 * @param showArchived - Whether to include archived notifications
 */
export const fetchGoodsNotifications = async (showArchived: boolean) => {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  
  if (!userId) return { data: [], error: null };
  
  return await supabase
    .from('goods_exchange')
    .select(`*`)
    .eq('is_archived', showArchived)
    .eq('user_id', userId);
};

/**
 * Fetches skill notifications from the database
 * This fetcher is more complex as it needs to handle both skill sessions and skill exchange
 */
export const fetchSkillNotifications = async () => {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  
  if (!userId) return { data: [], error: null };
  
  return await supabase
    .from('skills_exchange')
    .select(`*`)
    .eq('user_id', userId);
};

/**
 * Helper function to check if an item is a skill session
 */
export const isSkillSession = (item: any): boolean => {
  return item && item.hasOwnProperty('requester_id') && item.hasOwnProperty('provider_id');
};

/**
 * Helper function to check if an item is a notification
 */
export const isNotification = (item: any): boolean => {
  return item && item.hasOwnProperty('user_id') && item.hasOwnProperty('notification_type');
};

/**
 * Processes safety notifications into a standard format
 */
export const processSafetyNotifications = (safetyUpdates: any[]): BaseNotification[] => {
  return safetyUpdates.map(update => ({
    id: update.id,
    user_id: update.author_id,
    actor_id: update.author_id, // Same as user for safety updates
    title: update.title,
    description: update.description,
    content_type: 'safety_updates',
    content_id: update.id,
    notification_type: 'safety',
    action_type: 'view',
    action_label: 'View Update',
    is_read: update.is_read || false,
    is_archived: update.is_archived || false,
    created_at: update.created_at,
    updated_at: update.created_at, // Safety updates don't have an updated_at field
    profiles: update.profiles || null
  }));
};

/**
 * Processes event notifications into a standard format
 */
export const processEventNotifications = (events: any[]): BaseNotification[] => {
  return events.map(event => ({
    id: event.id,
    user_id: event.host_id,
    actor_id: event.host_id, // Same as user for events
    title: event.title,
    description: event.description,
    content_type: 'events',
    content_id: event.id,
    notification_type: 'event',
    action_type: 'view',
    action_label: 'View Event',
    is_read: event.is_read || false,
    is_archived: event.is_archived || false,
    created_at: event.created_at,
    updated_at: event.created_at, // Events don't have an updated_at field
    profiles: event.profiles || null
  }));
};

/**
 * Processes support notifications into a standard format
 */
export const processSupportNotifications = (supportRequests: any[]): BaseNotification[] => {
  return supportRequests.map(request => ({
    id: request.id,
    user_id: request.user_id,
    actor_id: request.user_id, // Same as user for support requests
    title: request.title,
    description: request.description,
    content_type: 'support_requests',
    content_id: request.id,
    notification_type: 'support',
    action_type: 'view',
    action_label: 'View Request',
    is_read: request.is_read || false,
    is_archived: request.is_archived || false,
    created_at: request.created_at,
    updated_at: request.created_at, // Support requests don't have an updated_at field
  }));
};

/**
 * Processes skill notifications into a standard format
 */
export const processSkillNotifications = (skillRequests: any[], profilesMap: Map<string, any> = new Map()): BaseNotification[] => {
  return skillRequests.map(skill => ({
    id: skill.id,
    user_id: skill.user_id,
    actor_id: skill.user_id,
    title: skill.title,
    description: skill.description,
    content_type: 'skills_exchange',
    content_id: skill.id,
    notification_type: 'skills',
    action_type: 'view',
    action_label: skill.request_type === 'need' ? 'View Request' : 'View Offer',
    is_read: skill.is_read || false,
    is_archived: skill.is_archived || false,
    created_at: skill.created_at,
    updated_at: skill.created_at,
    profiles: profilesMap.get(skill.user_id) || null
  }));
};

/**
 * Processes goods notifications into a standard format
 */
export const processGoodsNotifications = (goodsItems: any[], profilesMap: Map<string, any> = new Map()): BaseNotification[] => {
  return goodsItems.map(item => ({
    id: item.id,
    user_id: item.user_id,
    actor_id: item.user_id,
    title: item.title,
    description: item.description,
    content_type: 'goods_exchange',
    content_id: item.id,
    notification_type: 'goods',
    action_type: 'view',
    action_label: item.request_type === 'need' ? 'View Request' : 'View Offer',
    is_read: item.is_read || false,
    is_archived: item.is_archived || false,
    created_at: item.created_at,
    updated_at: item.created_at,
    profiles: profilesMap.get(item.user_id) || null
  }));
};

/**
 * Fetches user profiles for a list of user IDs
 */
export const fetchUserProfiles = async (userIds: string[]) => {
  if (!userIds.length) return { data: [], error: null };
  
  // Remove duplicates
  const uniqueUserIds = [...new Set(userIds)];
  
  return await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', uniqueUserIds);
};

/**
 * Creates a map of user profiles for easier lookup
 */
export const createProfilesMap = (profiles: any[]): Map<string, any> => {
  const profilesMap = new Map();
  
  profiles.forEach(profile => {
    if (profile && profile.id) {
      profilesMap.set(profile.id, profile);
    }
  });
  
  return profilesMap;
};

/**
 * Main function to fetch all notifications from various sources
 * Now enhanced to include direct notifications from the notifications table
 */
export const fetchAllNotifications = async (showArchived: boolean): Promise<BaseNotification[]> => {
  logger.debug('Fetching all notifications, showArchived:', showArchived);
  
  // IMPORTANT: First, fetch direct notifications as the primary source of truth
  const directNotifications = await fetchDirectNotifications(showArchived);
  
  // Log the count of direct notifications
  logger.debug(`Found ${directNotifications.length} direct notifications`);
  
  // If we have direct notifications from the database triggers, just return those
  // This is a major simplification that prioritizes the notifications table
  if (directNotifications.length > 0) {
    logger.debug('Using direct notifications from notifications table');
    return directNotifications;
  }
  
  // As a fallback, if there are no direct notifications, fetch from other sources
  logger.debug('No direct notifications found, falling back to legacy sources');
  
  // Fetch everything concurrently for better performance
  const [
    safetyUpdatesResult, 
    eventsResult, 
    supportRequestsResult, 
    skillRequestsResult, 
    goodsItemsResult
  ] = await Promise.all([
    fetchSafetyNotifications(showArchived),
    fetchEventNotifications(showArchived),
    fetchSupportNotifications(showArchived),
    fetchSkillNotifications(),
    fetchGoodsNotifications(showArchived)
  ]);
  
  // Extract data (or empty arrays if there was an error)
  const safetyUpdates = safetyUpdatesResult.data || [];
  const events = eventsResult.data || [];
  const supportRequests = supportRequestsResult.data || [];
  const skillRequests = skillRequestsResult.data || [];
  const goodsItems = goodsItemsResult.data || [];
  
  // Collect all user IDs to fetch profiles
  const skillUserIds = skillRequests.map(skill => skill.user_id) || [];
  const goodsUserIds = goodsItems.map(item => item.user_id) || [];
  const allUserIds = [...skillUserIds, ...goodsUserIds];
  
  // Fetch profiles for all user IDs
  const userProfilesResult = await fetchUserProfiles(allUserIds);
  const userProfiles = userProfilesResult.data || [];
  const profilesMap = createProfilesMap(userProfiles);
  
  // Process each type of notification
  const safetyNotifications = processSafetyNotifications(safetyUpdates);
  const eventNotifications = processEventNotifications(events);
  const supportNotifications = processSupportNotifications(supportRequests);
  const skillNotifications = processSkillNotifications(skillRequests, profilesMap);
  const goodsNotifications = processGoodsNotifications(goodsItems, profilesMap);
  
  // Combine all notifications
  const allNotifications: BaseNotification[] = [
    ...safetyNotifications,
    ...eventNotifications,
    ...supportNotifications,
    ...skillNotifications,
    ...goodsNotifications
  ];
  
  logger.debug(`Combined legacy notifications count: ${allNotifications.length}`);
  
  // Sort by creation date, newest first
  return allNotifications.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};
