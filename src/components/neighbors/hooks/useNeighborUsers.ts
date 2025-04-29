
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserWithRole } from "@/types/roles";
import { useNeighborhood } from "@/contexts/neighborhood";

/**
 * Custom hook that fetches users in the current neighborhood
 * 
 * This updated version uses RPC functions to avoid the recursion issue
 * when fetching neighbor information
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
          // Use our RPC function to get profiles safely
          const { data: profiles, error } = await supabase
            .rpc('get_publicly_visible_profiles', {
              limit_num: 20
            });
            
          if (error) {
            console.error("[useNeighborUsers] Error fetching profiles:", error);
            throw error;
          }
          
          console.log("[useNeighborUsers] Fetched profiles as fallback:", {
            count: profiles?.length || 0
          });
          
          // Get the user emails through a separate RPC call
          const { data: authUsers, error: authError } = await supabase
            .rpc('get_visible_user_emails', {
              user_ids: profiles.map((p: any) => p.id)
            });
            
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

      // For neighborhoods, use RPC function for member data
      console.log("[useNeighborUsers] Fetching users for neighborhood:", currentNeighborhood.id);
      
      try {
        // Get members using our RPC function
        const { data: memberData, error: memberError } = await supabase
          .rpc('get_neighborhood_members_with_profiles', {
            neighborhood_uuid: currentNeighborhood.id
          });
          
        if (memberError) {
          console.error("[useNeighborUsers] Error fetching neighborhood members:", memberError);
          throw memberError;
        }
        
        // If no members found, return empty array
        if (!memberData || memberData.length === 0) {
          console.log("[useNeighborUsers] No members found, returning empty array");
          return [];
        }
        
        console.log("[useNeighborUsers] Found neighborhood members:", {
          memberCount: memberData.length,
          neighborhoodId: currentNeighborhood.id
        });
        
        // Transform data into expected format
        const usersWithProfiles = memberData.map((member: any) => {
          return {
            id: member.user_id,
            email: member.email,
            created_at: null, // We don't have this information in the response
            roles: ['user'], // Default role
            profiles: {
              display_name: member.display_name || 'Neighbor',
              avatar_url: member.avatar_url,
              address: member.address_visible ? member.address : null,
              phone_number: member.phone_visible ? member.phone_number : null,
              access_needs: member.needs_visible ? member.access_needs : null,
              email_visible: member.email_visible,
              phone_visible: member.phone_visible,
              address_visible: member.address_visible,
              needs_visible: member.needs_visible,
              bio: member.bio
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
    enabled: true
  });
};
