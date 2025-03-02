
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserWithRole } from "@/types/roles";
import { useNeighborhood } from "@/contexts/neighborhood";

/**
 * Custom hook that fetches users in the current neighborhood
 * 
 * This improved version handles the case when neighborhood data is not available
 * and provides a simpler approach to fetching user data
 */
export const useNeighborUsers = () => {
  // Get the current neighborhood from context
  const { currentNeighborhood } = useNeighborhood();

  // Log initial neighborhood context for debugging
  console.log("[useNeighborUsers] Starting hook with neighborhood:", {
    neighborhoodId: currentNeighborhood?.id,
    neighborhoodName: currentNeighborhood?.name,
    timestamp: new Date().toISOString()
  });

  return useQuery({
    // Include neighborhood ID in query key for automatic refetching when it changes
    queryKey: ['users-with-roles', currentNeighborhood?.id],
    queryFn: async () => {
      // If no neighborhood found, we'll return all profiles as a fallback
      // This ensures users see SOMETHING instead of an empty state
      if (!currentNeighborhood?.id) {
        console.log("[useNeighborUsers] No neighborhood found, fetching all profiles as fallback");
        
        try {
          // Simple query to get all profiles
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url, address, email_visible, phone_visible, address_visible, needs_visible, phone_number, access_needs, bio')
            .limit(20); // Limit to a reasonable number
            
          if (error) {
            console.error("[useNeighborUsers] Error fetching profiles:", error);
            throw error;
          }
          
          console.log("[useNeighborUsers] Fetched profiles as fallback:", {
            count: profiles?.length || 0
          });
          
          // Get the user emails
          const userIds = profiles.map(p => p.id);
          const { data: authUsers, error: authError } = await supabase
            .from('auth_users_view')
            .select('id, email, created_at')
            .in('id', userIds);
            
          if (authError) {
            console.error("[useNeighborUsers] Error fetching auth users:", authError);
            throw authError;
          }
          
          // Transform data into expected format
          const usersWithProfiles = profiles.map((profile: any) => {
            const authUser = authUsers.find((u: any) => u.id === profile.id);
            
            return {
              id: profile.id,
              email: authUser?.email,
              created_at: authUser?.created_at,
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
          });
          
          return usersWithProfiles as UserWithRole[];
        } catch (error) {
          console.error("[useNeighborUsers] Error in fallback data fetching:", error);
          throw error;
        }
      }

      // Normal neighborhood-based approach when we have a neighborhood
      console.log("[useNeighborUsers] Fetching users for neighborhood:", currentNeighborhood.id);
      
      try {
        // Start with the neighborhood creator
        const creatorId = currentNeighborhood.created_by;
        let userIds = [creatorId];
        
        // Then use our new function to get other members
        const { data: memberIds, error: rpcError } = await supabase.rpc('get_neighborhood_members_safe', {
          neighborhood_uuid: currentNeighborhood.id
        });
        
        if (!rpcError && memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
          userIds = [...new Set([...userIds, ...memberIds])];
        }
        
        // Fetch profiles for these users
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, address, email_visible, phone_visible, address_visible, needs_visible, phone_number, access_needs, bio')
          .in('id', userIds);

        if (profilesError) {
          console.error("[useNeighborUsers] Error fetching profiles:", profilesError);
          throw profilesError;
        }

        // Fetch user emails
        const { data: authUsers, error: authError } = await supabase
          .from('auth_users_view')
          .select('id, email, created_at')
          .in('id', userIds);

        if (authError) {
          console.error("[useNeighborUsers] Error fetching auth users:", authError);
          throw authError;
        }

        // Combine all the data
        const usersWithProfiles = profiles.map((profile: any) => {
          const authUser = authUsers.find((u: any) => u.id === profile.id);
          
          return {
            id: profile.id,
            email: authUser?.email,
            created_at: authUser?.created_at,
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
        });
        
        return usersWithProfiles as UserWithRole[];
      } catch (error) {
        console.error("[useNeighborUsers] Error in data fetching:", error);
        throw error;
      }
    },
    // Always enable the query, even without a neighborhood
    // This ensures users always see some profiles
    enabled: true
  });
};
