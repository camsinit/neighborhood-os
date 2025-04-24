
import { supabase } from "@/integrations/supabase/client";

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
      ...(skillSessionsResult.data || []),
      ...(notificationsResult.data || [])
    ]
  };
  
  return combinedData;
};
