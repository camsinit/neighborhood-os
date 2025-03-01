
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * This hook fetches all support requests from the database
 * 
 * The query fetches from both the support_requests table (for backward compatibility)
 * AND from the goods_exchange table for goods-specific items
 */
export const useSupportRequests = () => {
  return useQuery({
    queryKey: ["support-requests"],
    queryFn: async () => {
      console.log("Fetching support requests from support_requests and goods_exchange tables");
      
      // First, get support requests from the original table
      const { data: supportData, error: supportError } = await supabase
        .from("support_requests")
        .select(`
          *,
          profiles: user_id (
            id,
            display_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (supportError) {
        console.error("Error fetching support requests:", supportError);
        throw supportError;
      }

      // Next, get goods items from the goods_exchange table
      const { data: goodsData, error: goodsError } = await supabase
        .from("goods_exchange")
        .select(`
          *,
          profiles: user_id (
            id,
            display_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (goodsError) {
        console.error("Error fetching goods exchange items:", goodsError);
        throw goodsError;
      }

      console.log("Fetched support requests:", supportData ? supportData.length : 0, "items");
      console.log("Fetched goods exchange items:", goodsData ? goodsData.length : 0, "items");
      
      // Combine both sets of data
      const combinedData = [...(supportData || []), ...(goodsData || [])];
      
      // Sort by created_at date (newest first)
      combinedData.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      return combinedData;
    },
  });
};
