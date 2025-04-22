
import { supabase } from "@/integrations/supabase/client";

export const fetchGoodsNotifications = async (showArchived: boolean) => {
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
    .eq('is_archived', showArchived)
    .order("created_at", { ascending: false })
    .limit(5);
};
