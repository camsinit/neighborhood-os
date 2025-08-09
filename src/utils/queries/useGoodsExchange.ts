
import { supabase } from "@/integrations/supabase/client";
import { useNeighborhoodQuery } from "@/hooks/useNeighborhoodQuery";
import { createLogger } from "@/utils/logger";

// Logger for this hook to keep debug output consistent
const logger = createLogger('useGoodsExchange');

/**
 * This hook fetches all goods exchange items from the database
 * Now properly filtered by current neighborhood
 * 
 * It's specific to the Goods page and doesn't interact with deprecated tables.
 */
export const useGoodsExchange = () => {
  // Use neighborhood-aware query to automatically include neighborhood in key and gating
  return useNeighborhoodQuery<any[]>(
    ["goods-exchange"],
    async (neighborhoodId: string) => {
      logger.info("Fetching goods exchange items", { neighborhoodId, timestamp: new Date().toISOString() });
      
      // Get goods items from the goods_exchange table filtered by current neighborhood
      const { data: goodsData, error: goodsError } = await supabase
        .from("goods_exchange")
        .select('*')
        .eq('neighborhood_id', neighborhoodId)
        .order("created_at", { ascending: false });

      // If there's an error fetching goods data, log it and throw
      if (goodsError) {
        logger.error("Error fetching goods exchange items", { error: goodsError, neighborhoodId, timestamp: new Date().toISOString() });
        throw goodsError;
      }

      logger.info("Fetched goods exchange items", { count: goodsData ? goodsData.length : 0, neighborhoodId });
      
      // Now, if we have goods data, let's get the user profiles for each item
      let goodsWithProfiles: any[] = [];
      if (goodsData && goodsData.length > 0) {
        // Get a unique list of user IDs from the goods data
        const userIds = [...new Set(goodsData.map(item => item.user_id))];
        
        try {
          // Fetch profile data for these users including contact information
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select('id, display_name, avatar_url, phone_number, phone_visible, email_visible, address, address_visible')
            .in('id', userIds);
            
          // Check if there was an error fetching profiles
          if (profilesError) {
            logger.error("Error fetching profiles for goods items", { error: profilesError });
            // Don't throw here, we'll just proceed without profiles
            return goodsData.map(item => ({
              ...item,
              profiles: null // No profile data available
            }));
          }
          
          // Create a map of user IDs to profile data for quick lookup
          const profilesMap: Record<string, any> = {};
          
          // Only process profilesData if it exists and is an array
          if (profilesData && Array.isArray(profilesData)) {
            profilesData.forEach(profile => {
              if (!profile) return; // Skip any null profiles
              if (profile && typeof profile === 'object' && 'id' in profile) {
                const profileId = (profile as any).id;
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
          logger.error("Error handling profiles for goods items", { error });
          // If there's an error with profiles, we'll still return the goods data without profiles
          goodsWithProfiles = goodsData.map(item => ({
            ...item,
            profiles: null
          }));
        }
        
        logger.info("Added profiles to goods items", { count: goodsWithProfiles.length });
      } else {
        goodsWithProfiles = [];
      }
      
      // Sort by created_at date (newest first)
      goodsWithProfiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return goodsWithProfiles;
    }
  );
};
