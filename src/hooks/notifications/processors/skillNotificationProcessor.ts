/**
 * This file handles the processing of skill notifications
 * It contains utility functions for transforming skill notification data
 */
import { BaseNotification } from "../types";
import { ProfileData } from "../types";
import { 
  SkillNotificationItem,
  SkillSession as FetchedSkillSession,
  SkillNotification,
  isSkillSession,
  isNotification
} from "../fetchers/fetchSkillNotifications";

/**
 * Type definitions to help TypeScript understand our data structures
 */
// Define the shape of a skill session
interface SkillSession extends FetchedSkillSession {
  requester?: {
    display_name?: string;
    avatar_url?: string;
  };
  skill?: {
    title?: string;
    time_preferences?: string[];
    availability?: string;
  };
}

// Define the shape of a notification
export interface SkillNotification {
  id: string;
  created_at: string;
  title: string | null;
  content_id: string;
  content_type: string;
  user_id: string;
  actor_id: string;
  metadata: any;
  is_read: boolean;
  is_archived: boolean;
}

// Union type for items that could be either a session or notification
export type SkillNotificationItem = SkillSession | SkillNotification;

/**
 * Type guard to check if an item is a skill session
 * 
 * This helps TypeScript understand what properties are available
 */
export function isSkillSession(item: any): item is SkillSession {
  // Check for properties that uniquely identify a skill session
  return item && 
    typeof item === 'object' && 
    'requester_id' in item && 
    'provider_id' in item &&
    'skill_id' in item;
}

/**
 * Type guard to check if an item is a notification
 * 
 * This helps TypeScript understand what properties are available
 */
export function isNotification(item: any): item is SkillNotification {
  // Check for properties that uniquely identify a notification
  return item && 
    typeof item === 'object' && 
    'actor_id' in item && 
    'content_type' in item && 
    'metadata' in item;
}

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
  return skillRequests.map((item): BaseNotification => {
    // Handle notification type items (from notifications table)
    if (isNotification(item)) {
      const actorProfile = item.actor_id ? profilesMap[item.actor_id] : null;
      
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
      const requesterProfile = item.requester_id ? profilesMap[item.requester_id] : null;
      
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
        id: typeof item === 'object' && item !== null ? String(item.id || 'unknown') : 'unknown',
        title: "Unknown notification",
        type: "skills" as const,
        created_at: typeof item === 'object' && item !== null ? 
          String(item.created_at || new Date().toISOString()) : 
          new Date().toISOString(),
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
