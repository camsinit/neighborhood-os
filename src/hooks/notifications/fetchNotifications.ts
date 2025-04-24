
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
  const requesterIds = skillRequests.map(session => session.requester_id) || [];
  const goodsUserIds = goodsItems.map(item => item.user_id) || [];
  const allUserIds = [...requesterIds, ...goodsUserIds];
  
  console.log("[fetchAllNotifications] User IDs to fetch profiles for:", allUserIds);
  
  // Fetch the actual user profile data
  const userProfilesResult = await fetchUserProfiles(allUserIds);
  const userProfiles = userProfilesResult.data || [];
  const profilesMap = createProfilesMap(userProfiles);

  // Process skill requests with detailed logging
  const skillNotifications = skillRequests.map(session => {
    const requesterProfile = profilesMap[session.requester_id] || { display_name: null, avatar_url: null };
    
    console.log("[fetchAllNotifications] Processing skill session:", { 
      sessionId: session.id,
      skillId: session.skill_id,
      requester: session.requester_id,
      provider: session.provider_id,
      status: session.status,
      skillTitle: session.skill?.title
    });
    
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
      is_read: false, // see original code logic
      is_archived: false,
      context: {
        contextType: "skill_request" as const,
        neighborName: requesterProfile.display_name || null,
        avatarUrl: requesterProfile.avatar_url || null,
        skillRequestData
      }
    };
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
