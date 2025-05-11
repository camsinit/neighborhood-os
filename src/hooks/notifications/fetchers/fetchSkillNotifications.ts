
import { supabase } from "@/integrations/supabase/client";

/**
 * Defines the two types of data we're working with
 * This helps TypeScript understand what properties each type has
 */
export interface SkillSession {
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

export interface SkillNotification {
  id: string;
  created_at: string;
  updated_at: string;
  title: string | null;
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
 * Fetches skill notifications that are directly relevant to the current user
 * 
 * This function has been enhanced to fetch:
 * 1. Skill sessions where the user is the provider (pending their action)
 * 2. Skill sessions where the user is the requester
 * 3. Notifications related to skill requests where the user is directly involved
 * 
 * @returns Supabase query result with relevant skill sessions and notifications
 */
export const fetchSkillNotifications = async () => {
  console.log("[fetchSkillNotifications] Starting to fetch skill notifications");
  
  // Get the current user ID
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  
  if (!userId) {
    console.warn("[fetchSkillNotifications] No authenticated user found");
    return { data: [], error: null };
  }
  
  // First get skill sessions where the user is the provider (action needed)
  const providerSessionsResult = await supabase
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
    .eq('provider_id', userId)
    .eq('status', 'pending_provider_times')
    .order("created_at", { ascending: false });
  
  // Then get skill sessions where the user is the requester
  const requesterSessionsResult = await supabase
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
    .eq('requester_id', userId)
    .order("created_at", { ascending: false })
    .limit(5);
  
  // Then get specific skill-related notifications where the user is directly involved
  const notificationsResult = await supabase
    .from("notifications")
    .select(`
      id,
      created_at,
      updated_at,
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
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order("created_at", { ascending: false });
  
  // Log the results for debugging
  console.log("[fetchSkillNotifications] Provider sessions query result:", {
    count: providerSessionsResult.data?.length || 0,
    error: providerSessionsResult.error?.message || null,
  });
  
  console.log("[fetchSkillNotifications] Requester sessions query result:", {
    count: requesterSessionsResult.data?.length || 0,
    error: requesterSessionsResult.error?.message || null,
  });
  
  console.log("[fetchSkillNotifications] Skill notifications query result:", {
    count: notificationsResult.data?.length || 0,
    error: notificationsResult.error?.message || null,
  });
  
  // Combine the data from all queries
  const combinedData = {
    ...providerSessionsResult,
    data: [
      ...(providerSessionsResult.data || []) as unknown as SkillSession[],
      ...(requesterSessionsResult.data || []) as unknown as SkillSession[],
      ...(notificationsResult.data || []) as unknown as SkillNotification[]
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

export const isNotification = (item: SkillNotificationItem): item is SkillNotification => {
  // Check for key properties that would exist in a notification but not in a skill session
  return item && 'notification_type' in item && 'metadata' in item && 'actor_id' in item;
};
