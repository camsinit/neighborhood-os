
/**
 * Main function to fetch all notifications from various sources
 */
import { BaseNotification, ProfileData } from "./types";
// Import all fetchers
import { fetchSafetyNotifications } from "./fetchers/fetchSafetyNotifications";
import { fetchEventNotifications } from "./fetchers/fetchEventNotifications";
import { fetchSupportNotifications } from "./fetchers/fetchSupportNotifications";
import { fetchSkillNotifications } from "./fetchers/fetchSkillNotifications";
import { fetchGoodsNotifications } from "./fetchers/fetchGoodsNotifications";
import { fetchUserProfiles } from "./fetchers/fetchUserProfiles";
import { createProfilesMap } from "./fetchers/createProfilesMap";
import { SkillRequestNotification } from "@/components/skills/types/skillTypes";

/**
 * Helper function to check if an item is a skill session
 */
const isSkillSession = (item: any): boolean => {
  // Check for key properties that would exist in a skill session but not in a notification
  return item && 'skill_id' in item && 'requester_id' in item && 'provider_id' in item;
};

/**
 * Helper function to check if an item is a notification
 */
const isNotification = (item: any): boolean => {
  // Check for key properties that would exist in a notification but not in a skill session
  return item && 'notification_type' in item && 'metadata' in item && 'actor_id' in item;
};

export const fetchAllNotifications = async (showArchived: boolean): Promise<BaseNotification[]> => {
  console.log("[fetchAllNotifications] Starting to fetch all notifications, showArchived:", showArchived);
  
  // Fetch everything concurrently, so the user doesn't wait for each database call
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
  
  console.log("[fetchAllNotifications] Skill requests result:", {
    count: skillRequestsResult.data?.length || 0,
    error: skillRequestsResult.error?.message || null
  });
  
  // Extract data (or empty if API errors)
  const safetyUpdates = safetyUpdatesResult.data || [];
  const events = eventsResult.data || [];
  const supportRequests = supportRequestsResult.data || [];
  const skillRequests = skillRequestsResult.data || [];
  const goodsItems = goodsItemsResult.data || [];
  
  // Build up all the user IDs to fetch their profiles
  // Using type guards to safely extract IDs
  const requesterIds = skillRequests
    .filter(isSkillSession)
    .map(session => session.requester_id) || [];
    
  const actorIds = skillRequests
    .filter(isNotification)
    .map(notification => notification.actor_id) || [];
    
  const goodsUserIds = goodsItems.map(item => item.user_id) || [];
  const allUserIds = [...requesterIds, ...actorIds, ...goodsUserIds];
  
  console.log("[fetchAllNotifications] User IDs to fetch profiles for:", allUserIds);
  
  // Fetch the actual user profile data
  const userProfilesResult = await fetchUserProfiles(allUserIds);
  const userProfiles = userProfilesResult.data || [];
  const profilesMap = createProfilesMap(userProfiles);

  // Process skill requests with detailed logging
  // This processes two different types of data in the skillRequests array:
  // 1. Skill sessions that come from the skill_sessions table
  // 2. Notifications that come from the notifications table
  const skillNotifications = skillRequests.map(item => {
    // Handle notification type items (from notifications table)
    if (isNotification(item)) {
      const actorProfile = item.actor_id ? profilesMap[item.actor_id] || { display_name: null, avatar_url: null } : null;
      
      console.log("[fetchAllNotifications] Processing skill notification:", { 
        id: item.id,
        title: item.title,
        metadata: item.metadata
      });
      
      // Map notification data directly
      return {
        id: item.id,
        title: item.title || "Skill notification",
        type: "skills" as const,
        created_at: item.created_at,
        is_read: item.is_read || false,
        is_archived: item.is_archived || false,
        context: {
          contextType: "skill_request" as const,
          neighborName: actorProfile?.display_name || item.metadata?.requesterName || null,
          avatarUrl: actorProfile?.avatar_url || item.metadata?.requesterAvatar || null,
          skillRequestData: {
            skillId: item.metadata?.skillId || item.content_id,
            requesterId: item.metadata?.requesterId || item.actor_id,
            providerId: item.user_id,
            skillTitle: item.metadata?.skillTitle || item.title,
            requesterName: actorProfile?.display_name || item.metadata?.requesterName || null,
            requesterAvatar: actorProfile?.avatar_url || item.metadata?.requesterAvatar || null,
            timePreferences: null,
            availability: null
          }
        }
      };
    } 
    
    // Handle skill session type items (from skill_sessions table)
    else if (isSkillSession(item)) {
      const requesterProfile = item.requester_id ? profilesMap[item.requester_id] || { display_name: null, avatar_url: null } : null;
      
      console.log("[fetchAllNotifications] Processing skill session:", { 
        sessionId: item.id,
        skillId: item.skill_id,
        requester: item.requester_id,
        provider: item.provider_id,
        status: item.status,
        skillTitle: item.skill?.title
      });
      
      const skillRequestData: SkillRequestNotification = {
        skillId: item.skill_id,
        requesterId: item.requester_id,
        providerId: item.provider_id,
        skillTitle: item.skill?.title || "Unnamed skill",
        requesterName: requesterProfile.display_name || null,
        requesterAvatar: requesterProfile.avatar_url || null,
        timePreferences: item.skill?.time_preferences || null,
        availability: item.skill?.availability || null
      };
      
      return {
        id: item.id,
        title: item.skill?.title || "New skill request",
        type: "skills" as const,
        created_at: item.created_at,
        is_read: false,
        is_archived: false,
        context: {
          contextType: "skill_request" as const,
          neighborName: requesterProfile.display_name || null,
          avatarUrl: requesterProfile.avatar_url || null,
          skillRequestData
        }
      };
    }
    
    // Fallback for any unexpected item format
    else {
      console.warn("[fetchAllNotifications] Unrecognized item format:", item);
      return {
        id: item.id || "unknown",
        title: "Unknown notification",
        type: "skills" as const,
        created_at: item.created_at || new Date().toISOString(),
        is_read: false,
        is_archived: false,
        context: {
          contextType: "skill_request" as const,
          neighborName: null,
          avatarUrl: null
        }
      };
    }
  });
  
  // Return final sorted notifications
  const allNotifications: BaseNotification[] = [
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
    ...skillNotifications,
    ...goodsItems.map(item => {
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
  
  console.log("[fetchAllNotifications] Final notification count:", allNotifications.length);
  
  return allNotifications.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};
