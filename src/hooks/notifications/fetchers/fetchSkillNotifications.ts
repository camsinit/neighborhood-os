
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches skill notifications (requests, completions, etc)
 * 
 * @param showArchived - Whether to include archived notifications
 * @returns Supabase query result with skill sessions
 */
export const fetchSkillNotifications = async () => {
  console.log("[fetchSkillNotifications] Starting to fetch skill notifications");
  
  const result = await supabase
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
  
  console.log("[fetchSkillNotifications] Query result:", {
    count: result.data?.length || 0,
    error: result.error?.message || null,
    statusCode: result.status,
    data: result.data
  });
  
  return result;
};
