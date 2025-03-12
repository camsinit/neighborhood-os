
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

      // If there's an error fetching goods data, log it and throw
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
        
        try {
          // Fetch profile data for these users
          // Note: Make sure we only request columns that actually exist in the profiles table
          // Removing 'email' since it appears this column doesn't exist directly in profiles
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select('id, display_name, avatar_url')
            .in('id', userIds);
            
          // Check if there was an error fetching profiles
          if (profilesError) {
            console.error("Error fetching profiles for goods items:", profilesError);
            // Don't throw here, we'll just proceed without profiles
            
            // Still need to return the goods data without profiles
            return goodsData.map(item => ({
              ...item,
              profiles: null // No profile data available
            }));
          }
          
          // Create a map of user IDs to profile data for quick lookup
          const profilesMap: Record<string, any> = {};
          
          // Only process profilesData if it exists and is an array
          if (profilesData && Array.isArray(profilesData)) {
            // Process each profile safely
            profilesData.forEach(profile => {
              // Skip any null profiles
              if (!profile) return;
              
              // We need to check if the profile has an id before using it
              if (profile && typeof profile === 'object' && 'id' in profile) {
                const profileId = profile.id;
                if (profileId) {
                  profilesMap[String(profileId)] = profile;
                }
              }
            });
          }
          
          // Attach profile data to each goods item
          goodsWithProfiles = goodsData.map(item => {
            // For each item, look up its user's profile in our map
            let userProfile = null;
            
            // Only try to get the profile if we have a user ID
            if (item.user_id) {
              // Convert to string for consistent lookup
              const lookupKey = String(item.user_id);
              userProfile = profilesMap[lookupKey] || null;
            }
            
            // Return the item with the profile attached
            return {
              ...item,
              profiles: userProfile
            };
          });
        } catch (error) {
          console.error("Error handling profiles for goods items:", error);
          // If there's an error with profiles, we'll still return the goods data without profiles
          goodsWithProfiles = goodsData.map(item => ({
            ...item,
            profiles: null // Error occurred, so no profile data
          }));
        }
        
        console.log("Added profiles to goods items:", goodsWithProfiles.length);
      } else {
        // If there are no goods items, return an empty array
        goodsWithProfiles = [];
      }
      
      // Sort by created_at date (newest first)
      goodsWithProfiles.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      return goodsWithProfiles;
    },
  });
};
