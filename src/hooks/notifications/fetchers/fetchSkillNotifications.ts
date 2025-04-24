
import { supabase } from "@/integrations/supabase/client";

/**
 * Defines the two types of data we're working with
 * This helps TypeScript understand what properties each type has
 */
interface SkillSession {
  id: string;
  created_at: string;
  status: string;
  skill_id: string;
  requester_id: string;
  provider_id: string;
  requester: { id: string } | null;
  skill: {
    id: string;
    title: string;
    description: string;
    availability: string | null;
    time_preferences: string[] | null;
  } | null;
}

interface SkillNotification {
  id: string;
  created_at: string;
  title: string;
  content_id: string;
  content_type: string;
  notification_type: string;
  is_read: boolean;
  is_archived: boolean;
  metadata: any;
  user_id: string;
  actor_id: string;
  actor: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

// Define a union type for our result data
export type SkillNotificationItem = SkillSession | SkillNotification;

/**
 * Fetches skill notifications (requests, completions, etc)
 * 
 * This function has been enhanced to fetch:
 * 1. Skill sessions with pending status
 * 2. Notifications related to skill requests
 * 
 * @param showArchived - Whether to include archived notifications
 * @returns Supabase query result with skill sessions and notifications
 */
export const fetchSkillNotifications = async () => {
  console.log("[fetchSkillNotifications] Starting to fetch skill notifications");
  
  // First get skill sessions that are pending provider action
  const skillSessionsResult = await supabase
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
  
  // Then get specific skill-related notifications 
  const notificationsResult = await supabase
    .from("notifications")
    .select(`
      id,
      created_at,
      title,
      content_id,
      content_type,
      notification_type,
      is_read,
      is_archived,
      metadata,
      user_id,
      actor_id,
      actor:actor_id (
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('notification_type', 'skills')
    .eq('content_type', 'skill_request')
    .eq('is_archived', false)
    .order("created_at", { ascending: false });
  
  // Log the results for debugging
  console.log("[fetchSkillNotifications] Skill sessions query result:", {
    count: skillSessionsResult.data?.length || 0,
    error: skillSessionsResult.error?.message || null,
    statusCode: skillSessionsResult.status,
  });
  
  console.log("[fetchSkillNotifications] Skill notifications query result:", {
    count: notificationsResult.data?.length || 0,
    error: notificationsResult.error?.message || null,
    statusCode: notificationsResult.status,
    data: notificationsResult.data
  });
  
  // Combine the data from both queries
  const combinedData = {
    ...skillSessionsResult,
    data: [
      ...(skillSessionsResult.data || []) as SkillSession[],
      ...(notificationsResult.data || []) as SkillNotification[]
    ] as SkillNotificationItem[]
  };
  
  return combinedData;
};

/**
 * Type guard to check if an item is a skill session
 * This helps TypeScript understand when we're working with a skill session
 */
export const isSkillSession = (item: SkillNotificationItem): item is SkillSession => {
  // Check for key properties that would exist in a skill session but not in a notification
  return item && 'skill_id' in item && 'requester_id' in item && 'provider_id' in item;
};

/**
 * Type guard to check if an item is a notification
 * This helps TypeScript understand when we're working with a notification
 */
export const isNotification = (item: SkillNotificationItem): item is SkillNotification => {
  // Check for key properties that would exist in a notification but not in a skill session
  return item && 'notification_type' in item && 'metadata' in item && 'actor_id' in item;
};
