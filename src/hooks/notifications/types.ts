
/**
 * This file defines the types used in the notifications system
 * We've separated these from the implementation to make the code more maintainable
 */
import { SkillRequestNotification } from "@/components/skills/types/skillTypes";

/**
 * Base notification structure that all specific notification types extend
 */
export interface BaseNotification {
  id: string;
  title: string;
  type: "safety" | "event" | "support" | "skills" | "goods" | "neighbors";
  created_at: string;
  is_read: boolean;
  is_archived: boolean;
  context: NotificationContext;
}

/**
 * The different types of notification contexts
 */
export type NotificationContextType = 
  | "help_request" 
  | "event_invite" 
  | "safety_alert" 
  | "skill_request" 
  | "goods_offer" 
  | "goods_request" 
  | "neighbor_join";

/**
 * The context information for a notification
 */
export interface NotificationContext {
  contextType: NotificationContextType;
  neighborName: string | null;
  avatarUrl: string | null;
  skillRequestData?: SkillRequestNotification;
}

/**
 * Skill Notification Context with specific fields for skill requests
 */
export interface SkillNotificationContext extends NotificationContext {
  contextType: "skill_request";
  skillRequestData: SkillRequestNotification;
}

/**
 * Mapping from notification types to their database tables
 */
export type NotificationTableMap = {
  safety: "safety_updates";
  event: "events";
  support: "support_requests";
  skills: "skill_sessions";
  goods: "goods_exchange";
  neighbors: "neighborhood_members";
};

/**
 * Profile data structure with display name and avatar
 */
export interface ProfileData {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}
