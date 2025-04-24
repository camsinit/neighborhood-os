
/**
 * This file handles the processing of skill notifications
 * It contains utility functions for transforming skill notification data
 */
import { BaseNotification } from "../types";
import { ProfileData } from "../types";
import { SkillNotificationItem, isSkillSession, isNotification } from "../fetchers/fetchSkillNotifications";

/**
 * Processes skill notifications (both skill sessions and notifications)
 * 
 * @param skillRequests - The combined list of skill sessions and notifications
 * @param profilesMap - Map of user IDs to profile data
 * @returns An array of processed notifications
 */
export const processSkillNotifications = (
  skillRequests: SkillNotificationItem[],
  profilesMap: Record<string, ProfileData>
): BaseNotification[] => {
  console.log("[processSkillNotifications] Processing skill notifications:", skillRequests.length);
  
  // Map through the combined data, using our type guards to determine how to process each item
  return skillRequests.map((item) => {
    // Handle notification type items (from notifications table)
    if (isNotification(item)) {
      const actorProfile = item.actor_id ? profilesMap[item.actor_id] || { display_name: null, avatar_url: null } : null;
      
      console.log("[processSkillNotifications] Processing skill notification:", { 
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
      
      console.log("[processSkillNotifications] Processing skill session:", { 
        sessionId: item.id,
        skillId: item.skill_id,
        requester: item.requester_id,
        provider: item.provider_id,
        status: item.status,
        skillTitle: item.skill?.title
      });
      
      return {
        id: item.id,
        title: item.skill?.title || "New skill request",
        type: "skills" as const,
        created_at: item.created_at,
        is_read: false,
        is_archived: false,
        context: {
          contextType: "skill_request" as const,
          neighborName: requesterProfile?.display_name || null,
          avatarUrl: requesterProfile?.avatar_url || null,
          skillRequestData: {
            skillId: item.skill_id,
            requesterId: item.requester_id,
            providerId: item.provider_id,
            skillTitle: item.skill?.title || "Unnamed skill",
            requesterName: requesterProfile?.display_name || null,
            requesterAvatar: requesterProfile?.avatar_url || null,
            timePreferences: item.skill?.time_preferences || null,
            availability: item.skill?.availability || null
          }
        }
      };
    }
    
    // Fallback for any unexpected item format
    else {
      console.warn("[processSkillNotifications] Unrecognized item format:", item);
      return {
        id: typeof item === 'object' && item !== null && 'id' in item ? String(item.id) : "unknown",
        title: "Unknown notification",
        type: "skills" as const,
        created_at: typeof item === 'object' && item !== null && 'created_at' in item ? String(item.created_at) : new Date().toISOString(),
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
};
