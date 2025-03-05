
/**
 * Updated useGoodsExchange hook that respects neighborhood context
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNeighborhood } from "@/hooks/useNeighborhood";

/**
 * Hook to fetch goods exchange items for the current neighborhood
 */
export const useGoodsExchange = () => {
  // Get the current neighborhood
  const { neighborhood, isLoading: isLoadingNeighborhood } = useNeighborhood();

  return useQuery({
    queryKey: ["goods-exchange", neighborhood?.id],
    queryFn: async () => {
      // If no neighborhood selected, return empty array
      if (!neighborhood?.id) {
        console.log("[useGoodsExchange] No neighborhood selected, returning empty array");
        return [];
      }
      
      console.log("[useGoodsExchange] Fetching goods for neighborhood:", neighborhood.id);
      
      // Get goods items from the goods_exchange table for the current neighborhood
      const { data: goodsData, error: goodsError } = await supabase
        .from("goods_exchange")
        .select('*')
        .eq('neighborhood_id', neighborhood.id)
        .order("created_at", { ascending: false });

      if (goodsError) {
        console.error("[useGoodsExchange] Error fetching goods exchange items:", goodsError);
        throw goodsError;
      }

      console.log("[useGoodsExchange] Fetched goods exchange items:", goodsData ? goodsData.length : 0, "items");
      
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
            
          if (profilesError) {
            console.error("[useGoodsExchange] Error fetching profiles for goods items:", profilesError);
            return goodsData.map(item => ({
              ...item,
              profiles: null
            }));
          }
          
          // Create a map of user IDs to profile data for quick lookup
          const profilesMap: Record<string, any> = {};
          
          if (profilesData && Array.isArray(profilesData)) {
            profilesData.forEach(profile => {
              if (!profile) return;
              
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
            let userProfile = null;
            
            if (item.user_id) {
              const lookupKey = String(item.user_id);
              userProfile = profilesMap[lookupKey] || null;
            }
            
            return {
              ...item,
              profiles: userProfile
            };
          });
        } catch (error) {
          console.error("[useGoodsExchange] Error handling profiles for goods items:", error);
          goodsWithProfiles = goodsData.map(item => ({
            ...item,
            profiles: null
          }));
        }
      } else {
        goodsWithProfiles = [];
      }
      
      // Sort by created_at date (newest first)
      goodsWithProfiles.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      return goodsWithProfiles;
    },
    // Only enable the query when we have a neighborhood
    enabled: !!neighborhood?.id && !isLoadingNeighborhood,
  });
};
