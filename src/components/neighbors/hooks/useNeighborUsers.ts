
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserWithRole } from "@/types/roles";
import { useNeighborhood } from "@/contexts/neighborhood";
import { createLogger } from "@/utils/logger";

const logger = createLogger('useNeighborUsers');

/**
 * Custom hook that fetches users in the current neighborhood
 * 
 * UPDATED: Uses simplified queries to avoid RLS recursion issues
 */
export const useNeighborUsers = () => {
  // Get the current neighborhood from context
  const { currentNeighborhood } = useNeighborhood();

  // Log initial neighborhood context for debugging
  logger.debug('Starting hook with neighborhood:', {
    neighborhoodId: currentNeighborhood?.id,
    neighborhoodName: currentNeighborhood?.name
  });

  return useQuery({
    // Include neighborhood ID in query key for automatic refetching when it changes
    queryKey: ['users-with-roles', currentNeighborhood?.id],
    queryFn: async () => {
      // If no neighborhood found, return empty array
      if (!currentNeighborhood?.id) {
        logger.debug('No neighborhood found, returning empty array');
        return [];
      }

      logger.debug('Fetching users for neighborhood:', currentNeighborhood.id);
      
      try {
        // Step 1: Get neighborhood members using simple query (no recursion)
        const { data: membersData, error: membersError } = await supabase
          .from('neighborhood_members')
          .select('user_id')
          .eq('neighborhood_id', currentNeighborhood.id)
          .eq('status', 'active');
          
        if (membersError) {
          logger.error('Error fetching neighborhood members:', membersError);
          throw membersError;
        }
        
        if (!membersData || membersData.length === 0) {
          logger.debug('No members found in neighborhood');
          return [];
        }

        logger.debug('Found members:', {
          memberCount: membersData.length,
          neighborhoodId: currentNeighborhood.id
        });
        
        // Step 2: Get user IDs for profile lookup
        const userIds = membersData.map(m => m.user_id);
        
        // Step 3: Get profiles for these users using simple query (no recursion)
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, address, phone_number, access_needs, email_visible, phone_visible, address_visible, needs_visible, bio')
          .in('id', userIds);
          
        if (profilesError) {
          logger.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }
        
        // Step 4: Transform data into expected format
        const usersWithProfiles = profilesData?.map((profile: any) => {
          return {
            id: profile.id,
            email: 'Protected', // We no longer expose emails from auth.users for security
            created_at: new Date().toISOString(), // Default timestamp
            roles: ['user'], // Default role
            profiles: {
              display_name: profile.display_name || 'Neighbor',
              avatar_url: profile.avatar_url,
              address: profile.address,
              phone_number: profile.phone_number,
              access_needs: profile.access_needs,
              email_visible: profile.email_visible,
              phone_visible: profile.phone_visible,
              address_visible: profile.address_visible,
              needs_visible: profile.needs_visible,
              bio: profile.bio
            }
          };
        }) || [];
        
        logger.debug('Successfully transformed user data:', {
          userCount: usersWithProfiles.length
        });
        
        return usersWithProfiles as UserWithRole[];
      } catch (error) {
        logger.error('Error in data fetching:', error);
        throw error;
      }
    },
    // Only enable the query when we have a neighborhood
    enabled: !!currentNeighborhood?.id
  });
};
