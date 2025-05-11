/**
 * Main function to fetch all notifications from various sources
 * Updated to only return notifications directly relevant to the current user
 */
import { BaseNotification } from "./types";

// Import all fetchers
import { fetchSafetyNotifications } from "./fetchers/fetchSafetyNotifications";
import { fetchEventNotifications } from "./fetchers/fetchEventNotifications";
import { fetchSupportNotifications } from "./fetchers/fetchSupportNotifications";
import { fetchSkillNotifications } from "./fetchers/fetchSkillNotifications";
import { fetchGoodsNotifications } from "./fetchers/fetchGoodsNotifications";
import { fetchUserProfiles } from "./fetchers/fetchUserProfiles";
import { createProfilesMap } from "./fetchers/createProfilesMap";

// Import notification processors
import { processSafetyNotifications } from "./processors/safetyNotificationProcessor";
import { processEventNotifications } from "./processors/eventNotificationProcessor";
import { processSupportNotifications } from "./processors/supportNotificationProcessor";
import { processSkillNotifications } from "./processors/skillNotificationProcessor";
import { processGoodsNotifications } from "./processors/goodsNotificationProcessor";
import { isSkillSession, isNotification } from "./fetchers/fetchSkillNotifications";

export const fetchAllNotifications = async (showArchived: boolean): Promise<BaseNotification[]> => {
  console.log("[fetchAllNotifications] Starting to fetch all relevant notifications, showArchived:", showArchived);
  
  // Fetch everything concurrently, so the user doesn't wait for each database call
  // Each fetcher is now responsible for filtering by user relevance
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

  // Process notifications using our specialized processors
  // Each processor remains the same, but now they're processing filtered data
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
  
  console.log("[fetchAllNotifications] Final relevant notification count:", allNotifications.length);
  
  // Sort by creation date, most recent first
  return allNotifications.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};
