
import { supabase } from "@/integrations/supabase/client";

export const fetchSupportNotifications = async (showArchived: boolean) => {
  return supabase.from("support_requests").select(`
    id, 
    title, 
    created_at, 
    is_read, 
    is_archived,
    profiles:user_id (
      display_name,
      avatar_url
    )
  `).eq('is_archived', showArchived).order("created_at", {
    ascending: false
  }).limit(5);
};
