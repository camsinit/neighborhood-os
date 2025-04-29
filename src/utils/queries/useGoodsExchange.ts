
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood"; 

/**
 * This hook fetches goods exchange items from the database for the current neighborhood
 * 
 * It applies RLS policies to ensure users only see items from their own neighborhood.
 */
export const useGoodsExchange = () => {
  // Get the current neighborhood
  const neighborhood = useCurrentNeighborhood();
  const neighborhoodId = neighborhood?.id;

  return useQuery({
    // Use a dedicated query key with neighborhood ID for proper caching
    queryKey: ["goods-exchange", neighborhoodId],
    queryFn: async () => {
      console.log(`[useGoodsExchange] Fetching goods exchange items for neighborhood: ${neighborhoodId || 'unknown'}`);
      
      // If no neighborhood is selected, return empty array
      if (!neighborhoodId) {
        console.warn("[useGoodsExchange] No neighborhood selected, returning empty array");
        return [];
      }
      
      // Get goods items from the goods_exchange table for this neighborhood
      const { data: goodsData, error: goodsError } = await supabase
        .from("goods_exchange")
        .select('*')
        .eq('neighborhood_id', neighborhoodId) // Filter by neighborhood
        .order("created_at", { ascending: false });

      // If there's an error fetching goods data, log it and throw
      if (goodsError) {
        console.error("[useGoodsExchange] Error fetching goods exchange items:", goodsError);
        throw goodsError;
      }

      console.log(`[useGoodsExchange] Fetched ${goodsData?.length || 0} goods exchange items`);
      
      // Now, if we have goods data, let's get the user profiles for each item
      let goodsWithProfiles = [];
      if (goodsData && goodsData.length > 0) {
        // Get a unique list of user IDs from the goods data
        const userIds = [...new Set(goodsData.map(item => item.user_id))];
        
        try {
          // Fetch profile data for these users
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select('id, display_name, avatar_url')
            .in('id', userIds);
            
          // Check if there was an error fetching profiles
          if (profilesError) {
            console.error("[useGoodsExchange] Error fetching profiles for goods items:", profilesError);
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
          console.error("[useGoodsExchange] Error handling profiles for goods items:", error);
          // If there's an error with profiles, we'll still return the goods data without profiles
          goodsWithProfiles = goodsData.map(item => ({
            ...item,
            profiles: null // Error occurred, so no profile data
          }));
        }
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
    // Only run this query if we have a neighborhood ID
    enabled: !!neighborhoodId
  });
};
