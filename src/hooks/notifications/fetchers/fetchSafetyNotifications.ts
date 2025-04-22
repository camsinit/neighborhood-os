
/**
 * Fetches safety notifications from the database
 * Each fetcher is split into its own file for clarity!
 */
import { supabase } from "@/integrations/supabase/client";

export const fetchSafetyNotifications = async (showArchived: boolean) => {
  // Fetch safety update rows, including author profile
  return supabase.from("safety_updates").select(`
    id, 
    title, 
    type, 
    created_at, 
    is_read, 
    is_archived,
    profiles:author_id (
      display_name,
      avatar_url
    )
  `).eq('is_archived', showArchived).order("created_at", {
    ascending: false
  }).limit(5);
};
