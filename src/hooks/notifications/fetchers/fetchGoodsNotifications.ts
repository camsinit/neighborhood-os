
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches goods exchange notifications that are directly relevant to the current user
 * Only includes goods items created by the user
 */
export const fetchGoodsNotifications = async (showArchived: boolean) => {
  // Get the current user ID
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  
  if (!userId) {
    console.warn("[fetchGoodsNotifications] No authenticated user found");
    return { data: [], error: null };
  }

  // Log the fetch attempt for debugging
  console.log(`[fetchGoodsNotifications] Fetching goods items for user ${userId}, showArchived=${showArchived}`);
  
  // Only return goods items created by this user
  return supabase
    .from("goods_exchange")
    .select(`
      id,
      title,
      request_type,
      created_at,
      is_read,
      is_archived,
      user_id
    `)
    .eq('user_id', userId)
    .eq('is_archived', showArchived)
    .order("created_at", { ascending: false });
};
