
/**
 * This file handles the processing of skill notifications
 * It contains utility functions for transforming skill notification data
 */
import { BaseNotification, ProfileData } from "../types";
import { isNotification, isSkillSession } from "../fetchers/fetchSkillNotifications";

/**
 * Interface defining the structure of a skill notification
 */
interface SkillNotification {
  id: string;
  user_id: string;
  actor_id?: string;
  title?: string;
  content_type: string;
  content_id: string;
  action_type?: string; // Add this property to fix the TypeScript error
  created_at: string;
  updated_at?: string;
  is_read?: boolean;
  is_archived?: boolean;
  actor?: {
    display_name?: string;
    avatar_url?: string;
  };
  metadata?: any;
}

/**
 * Processes skill notifications with enhanced context information
 * 
 * @param skillNotifications - Raw skill notifications data
 * @param profilesMap - Map of user profiles by ID
 * @returns An array of processed notifications with rich context
 */
export const processSkillNotifications = (
  skillNotifications: any[],
  profilesMap: Record<string, ProfileData> = {}
): BaseNotification[] => {
  console.log("[processSkillNotifications] Processing skill notifications:", skillNotifications.length);
  
  const result: BaseNotification[] = [];
  
  for (const item of skillNotifications) {
    // Handle skill sessions (pending provider action)
    if (isSkillSession(item)) {
      const skillSession = item;
      
      // Only process sessions with valid skill data
      if (skillSession.skill) {
        // Get requester profile for context
        const requesterProfile = skillSession.requester_id ? profilesMap[skillSession.requester_id] : null;
        
        result.push({
          id: skillSession.id,
          user_id: skillSession.provider_id || "unknown",
          title: skillSession.skill.title || "Skill Request",
          content_type: "skill_sessions",
          content_id: skillSession.id,
          notification_type: "skills",
          action_type: "request", // Add action type for descriptive text
          created_at: skillSession.created_at,
          updated_at: skillSession.created_at,
          is_read: false,
          is_archived: false,
          context: {
            contextType: "skill_request",
            skillId: skillSession.skill_id,
            requesterId: skillSession.requester_id,
            skillTitle: skillSession.skill.title,
            skillDescription: skillSession.skill.description,
            availability: skillSession.skill.availability,
            timePreferences: skillSession.skill.time_preferences,
            neighborName: requesterProfile?.display_name || "Someone",
            avatarUrl: requesterProfile?.avatar_url || null,
            skillRequestData: skillSession,
            // Add additional context for improved UI
            actionRequired: true,
            actionLabel: "Respond to request",
            // Add descriptive summary
            summary: `${requesterProfile?.display_name || "Someone"} has requested your skill: ${skillSession.skill.title}`
          },
          // High relevance for requests requiring action
          relevance_score: 3
        });
      }
    }
    
    // Handle skill notifications
    else if (isNotification(item)) {
      const notification = item as SkillNotification; // Ensure type safety with our interface
      const actorProfile = notification.actor_id ? profilesMap[notification.actor_id] : null;
      
      result.push({
        id: notification.id,
        user_id: notification.user_id || "unknown",
        actor_id: notification.actor_id,
        title: notification.title || "Skill Notification",
        content_type: notification.content_type,
        content_id: notification.content_id,
        notification_type: "skills",
        action_type: notification.action_type || "request", // Now this property exists in our interface
        created_at: notification.created_at,
        updated_at: notification.updated_at || notification.created_at,
        is_read: notification.is_read,
        is_archived: notification.is_archived,
        context: {
          contextType: "skill_request",
          neighborName: actorProfile?.display_name || notification.actor?.display_name || "A neighbor",
          avatarUrl: actorProfile?.avatar_url || notification.actor?.avatar_url || null,
          metadata: notification.metadata,
          // Add derived context for UI
          summary: `${actorProfile?.display_name || "Someone"} is interested in your skill`
        },
        // Medium relevance for general skill notifications
        relevance_score: 2
      });
    }
  }
  
  return result;
};

