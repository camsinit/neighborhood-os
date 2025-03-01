
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * This hook fetches all goods exchange items from the database
 * 
 * It's specific to the Goods page and doesn't interact with the support_requests table
 * or any other page's data.
 */
export const useGoodsExchange = () => {
  return useQuery({
    // Use a dedicated query key just for goods exchange
    queryKey: ["goods-exchange"],
    queryFn: async () => {
      console.log("Fetching goods exchange items from goods_exchange table");
      
      // Get goods items from the goods_exchange table
      const { data: goodsData, error: goodsError } = await supabase
        .from("goods_exchange")
        .select('*')
        .order("created_at", { ascending: false });

      if (goodsError) {
        console.error("Error fetching goods exchange items:", goodsError);
        throw goodsError;
      }

      console.log("Fetched goods exchange items:", goodsData ? goodsData.length : 0, "items");
      
      // Now, if we have goods data, let's get the user profiles for each item
      let goodsWithProfiles = [];
      if (goodsData && goodsData.length > 0) {
        // Get a unique list of user IDs from the goods data
        const userIds = [...new Set(goodsData.map(item => item.user_id))];
        
        // Fetch profile data for these users, including email
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select('id, display_name, avatar_url, email')  // Added email to the selection
          .in('id', userIds);
          
        if (profilesError) {
          console.error("Error fetching profiles for goods items:", profilesError);
          // Don't throw here, we'll just proceed with the goods data without profiles
        }
        
        // Create a map of user IDs to profile data for quick lookup
        const profilesMap = {};
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap[profile.id] = profile;
          });
        }
        
        // Attach profile data to each goods item
        goodsWithProfiles = goodsData.map(item => ({
          ...item,
          profiles: profilesMap[item.user_id] || null
        }));
        
        console.log("Added profiles to goods items:", goodsWithProfiles.length);
      }
      
      // Sort by created_at date (newest first)
      goodsWithProfiles.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      return goodsWithProfiles;
    },
  });
};
