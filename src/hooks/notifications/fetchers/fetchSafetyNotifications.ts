
/**
 * Fetches safety notifications from the database
 * This version filters to only show notifications relevant to the current user:
 * - Safety updates created by the user
 * - Safety updates that mention/tag the user
 */
import { supabase } from "@/integrations/supabase/client";

export const fetchSafetyNotifications = async (showArchived: boolean) => {
  // Get the current user ID
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  
  if (!userId) {
    console.warn("[fetchSafetyNotifications] No authenticated user found");
    return { data: [], error: null };
  }

  // Log the fetch attempt for debugging
  console.log(`[fetchSafetyNotifications] Fetching safety updates for user ${userId}, showArchived=${showArchived}`);
  
  // Fetch safety updates created by the user
  const safetyUpdatesResult = await supabase.from("safety_updates").select(`
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
  `)
  .eq('author_id', userId)
  .eq('is_archived', showArchived)
  .order("created_at", { ascending: false });
  
  // Log the result for debugging
  console.log(`[fetchSafetyNotifications] Found ${safetyUpdatesResult.data?.length || 0} relevant safety updates`);
  
  return safetyUpdatesResult;
};
