
import { supabase } from "@/integrations/supabase/client";

export const fetchEventNotifications = async (showArchived: boolean) => {
  return supabase.from("events").select(`
    id, 
    title, 
    created_at, 
    is_read, 
    is_archived,
    profiles:host_id (
      display_name,
      avatar_url
    )
  `).eq('is_archived', showArchived).order("created_at", {
    ascending: false
  }).limit(5);
};
