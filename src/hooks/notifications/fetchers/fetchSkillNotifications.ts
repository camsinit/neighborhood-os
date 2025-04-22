
import { supabase } from "@/integrations/supabase/client";

export const fetchSkillNotifications = async () => {
  return supabase
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
};
