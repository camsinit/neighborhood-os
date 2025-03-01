
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
      // The key issue: We need to remove the profiles join as it's causing an error
      // We'll manually join the profiles data below after fetching the goods items
      const { data: goodsData, error: goodsError } = await supabase
        .from("goods_exchange")
        .select('*')  // Just select all columns without trying to join profiles
        .order("created_at", { ascending: false });

      if (goodsError) {
        console.error("Error fetching goods exchange items:", goodsError);
        throw goodsError;
      }

      console.log("Fetched support requests:", supportData ? supportData.length : 0, "items");
      console.log("Fetched goods exchange items:", goodsData ? goodsData.length : 0, "items");
      
      // Now, if we have goods data, let's try to get the user profiles for each item
      let goodsWithProfiles = [];
      if (goodsData && goodsData.length > 0) {
        // Get a unique list of user IDs from the goods data
        const userIds = [...new Set(goodsData.map(item => item.user_id))];
        
        // Fetch profile data for these users
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select('id, display_name, avatar_url')
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
      
      // Combine both sets of data
      const combinedData = [...(supportData || []), ...goodsWithProfiles];
      
      // Sort by created_at date (newest first)
      combinedData.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      return combinedData;
    },
  });
};
