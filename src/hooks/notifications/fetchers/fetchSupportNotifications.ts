
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches support notifications that are directly relevant to the current user
 * Only includes support requests created by the user
 */
export const fetchSupportNotifications = async (showArchived: boolean) => {
  // Get the current user ID
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  
  if (!userId) {
    console.warn("[fetchSupportNotifications] No authenticated user found");
    return { data: [], error: null };
  }

  // Log the fetch attempt for debugging
  console.log(`[fetchSupportNotifications] Fetching support requests for user ${userId}, showArchived=${showArchived}`);
  
  // Only return support requests created by this user
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
  `)
  .eq('user_id', userId)
  .eq('is_archived', showArchived)
  .order("created_at", { ascending: false });
};
