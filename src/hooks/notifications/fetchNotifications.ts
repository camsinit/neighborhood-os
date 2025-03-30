
/**
 * This file contains functions for fetching different types of notifications
 * Each notification type has its own fetch function to keep the code organized
 */
import { supabase } from "@/integrations/supabase/client";
import { BaseNotification, ProfileData } from "./types";
import { SkillRequestNotification } from "@/components/skills/types/skillTypes";

/**
 * Fetches safety notifications from the database
 * 
 * @param showArchived Whether to fetch archived notifications
 * @returns Promise with safety notifications data and error (if any)
 */
export const fetchSafetyNotifications = async (showArchived: boolean) => {
  // Get safety updates
  return supabase.from("safety_updates").select(`
    id, 
    title, 
    type, 
    created_at, 
    is_read, 
    is_archived,
    profiles:author_id (
      display_name,
      avatar_url
    )
  `).eq('is_archived', showArchived).order("created_at", {
    ascending: false
  }).limit(5);
};

/**
 * Fetches event notifications from the database
 * 
 * @param showArchived Whether to fetch archived notifications
 * @returns Promise with event notifications data and error (if any)
 */
export const fetchEventNotifications = async (showArchived: boolean) => {
  // Get events
  return supabase.from("events").select(`
    id, 
    title, 
    created_at, 
    is_read, 
    is_archived,
    profiles:host_id (
      display_name,
      avatar_url
    )
  `).eq('is_archived', showArchived).order("created_at", {
    ascending: false
  }).limit(5);
};

/**
 * Fetches support request notifications from the database
 * 
 * @param showArchived Whether to fetch archived notifications
 * @returns Promise with support request notifications data and error (if any)
 */
export const fetchSupportNotifications = async (showArchived: boolean) => {
  // Get support requests
  return supabase.from("support_requests").select(`
    id, 
    title, 
    created_at, 
    is_read, 
    is_archived,
    profiles:user_id (
      display_name,
      avatar_url
    )
  `).eq('is_archived', showArchived).order("created_at", {
    ascending: false
  }).limit(5);
};

/**
 * Fetches skill request notifications from the database
 * 
 * @returns Promise with skill request notifications data and error (if any)
 */
export const fetchSkillNotifications = async () => {
  // Get skill sessions with pending status
  return supabase
    .from("skill_sessions")
    .select(`
      id,
      created_at,
      status,
      skill_id,
      requester_id,
      provider_id,
      requester:requester_id (
        id
      ),
      skill:skill_id (
        id,
        title,
        description,
        availability,
        time_preferences
      )
    `)
    .eq('status', 'pending_provider_times')
    .order("created_at", { ascending: false })
    .limit(5);
};

/**
 * Fetches goods exchange notifications from the database
 * 
 * @param showArchived Whether to fetch archived notifications
 * @returns Promise with goods exchange notifications data and error (if any)
 */
export const fetchGoodsNotifications = async (showArchived: boolean) => {
  // Get goods exchange items
  return supabase
    .from("goods_exchange")
    .select(`
      id,
      title,
      request_type,
      created_at,
      is_read,
      is_archived,
      user_id
    `)
    .eq('is_archived', showArchived)
    .order("created_at", { ascending: false })
    .limit(5);
};

/**
 * Fetches user profiles for a list of user IDs
 * 
 * @param userIds Array of user IDs to fetch profiles for
 * @returns Promise with user profiles data and error (if any)
 */
export const fetchUserProfiles = async (userIds: string[]) => {
  if (!userIds.length) return { data: [] };
  
  // Get user profiles
  return supabase
    .from("profiles")
    .select('id, display_name, avatar_url')
    .in('id', userIds);
};

/**
 * Creates a lookup map of user profiles indexed by user ID
 * 
 * @param profiles Array of user profiles
 * @returns Record mapping user IDs to profile data
 */
export const createProfilesMap = (profiles: ProfileData[] = []): Record<string, ProfileData> => {
  return profiles.reduce((map, profile) => {
    if (profile && profile.id) {
      map[profile.id] = profile;
    }
    return map;
  }, {} as Record<string, ProfileData>);
};

/**
 * Main function to fetch all notifications from various sources
 * 
 * @param showArchived Whether to fetch archived notifications
 * @returns Promise containing all notifications sorted by creation date
 */
export const fetchAllNotifications = async (showArchived: boolean): Promise<BaseNotification[]> => {
  // Fetch data from multiple tables concurrently for better performance
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
  
  // Extract the data from results
  const safetyUpdates = safetyUpdatesResult.data || [];
  const events = eventsResult.data || [];
  const supportRequests = supportRequestsResult.data || [];
  const skillRequests = skillRequestsResult.data || [];
  const goodsItems = goodsItemsResult.data || [];
  
  // Get requester IDs from skill sessions
  const requesterIds = skillRequests.map(session => session.requester_id) || [];
  
  // Get user IDs from goods items
  const goodsUserIds = goodsItems.map(item => item.user_id) || [];
  
  // Combine all user IDs we need to fetch profiles for
  const allUserIds = [...requesterIds, ...goodsUserIds];
  
  // Fetch profiles for all users we need
  const userProfilesResult = await fetchUserProfiles(allUserIds);
  const userProfiles = userProfilesResult.data || [];
  
  // Create a lookup map for all user profiles
  const profilesMap = createProfilesMap(userProfiles);
    
  // Process and combine all notifications
  const allNotifications: BaseNotification[] = [
    // Safety notifications
    ...safetyUpdates.map(update => ({
      id: update.id,
      title: update.title,
      type: "safety" as const,
      created_at: update.created_at,
      is_read: update.is_read,
      is_archived: update.is_archived,
      context: {
        contextType: "safety_alert" as const,
        neighborName: update.profiles?.display_name || null,
        avatarUrl: update.profiles?.avatar_url || null
      }
    })),
    
    // Event notifications
    ...events.map(event => ({
      id: event.id,
      title: event.title,
      type: "event" as const,
      created_at: event.created_at,
      is_read: event.is_read,
      is_archived: event.is_archived,
      context: {
        contextType: "event_invite" as const,
        neighborName: event.profiles?.display_name || null,
        avatarUrl: event.profiles?.avatar_url || null
      }
    })),
    
    // Support request notifications
    ...supportRequests.map(request => ({
      id: request.id,
      title: request.title,
      type: "support" as const,
      created_at: request.created_at,
      is_read: request.is_read,
      is_archived: request.is_archived,
      context: {
        contextType: "help_request" as const,
        neighborName: request.profiles?.display_name || null,
        avatarUrl: request.profiles?.avatar_url || null
      }
    })),
    
    // Skill request notifications
    ...skillRequests.map(session => {
      // Look up requester profile from our map
      const requesterProfile = profilesMap[session.requester_id] || { display_name: null, avatar_url: null };
      
      // Convert skill session data into a notification format
      const skillRequestData: SkillRequestNotification = {
        skillId: session.skill_id,
        requesterId: session.requester_id,
        providerId: session.provider_id,
        skillTitle: session.skill?.title || "Unnamed skill",
        requesterName: requesterProfile.display_name || null,
        requesterAvatar: requesterProfile.avatar_url || null,
        timePreferences: session.skill?.time_preferences || null,
        availability: session.skill?.availability || null
      };
      
      return {
        id: session.id,
        title: session.skill?.title || "New skill request",
        type: "skills" as const,
        created_at: session.created_at,
        is_read: false, // Skill sessions don't have a is_read flag yet
        is_archived: false, // Skill sessions don't have is_archived yet
        context: {
          contextType: "skill_request" as const,
          neighborName: requesterProfile.display_name || null,
          avatarUrl: requesterProfile.avatar_url || null,
          skillRequestData
        }
      };
    }),
    
    // Goods exchange notifications
    ...goodsItems.map(item => {
      // Look up the user profile from our profilesMap
      const userProfile = profilesMap[item.user_id] || { display_name: null, avatar_url: null };
      
      return {
        id: item.id,
        title: item.title,
        type: "goods" as const,
        created_at: item.created_at,
        is_read: item.is_read,
        is_archived: item.is_archived,
        context: {
          contextType: item.request_type === "offer" ? "goods_offer" as const : "goods_request" as const,
          neighborName: userProfile.display_name || null,
          avatarUrl: userProfile.avatar_url || null
        }
      };
    })
  ];
  
  // Sort all notifications by creation date (newest first)
  return allNotifications.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};
