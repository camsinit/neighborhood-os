
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserWithRole } from "@/types/roles";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";

/**
 * Custom hook that fetches users in the current neighborhood
 * 
 * This hook handles querying all the necessary user data (profiles, emails, roles)
 * and combines them into a single UserWithRole object for display in the directory
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
      // If no neighborhood found, return empty array
      if (!currentNeighborhood?.id) {
        console.log("[useNeighborUsers] No neighborhood found, skipping fetch");
        return [];
      }

      console.log("[useNeighborUsers] Fetching users for neighborhood:", currentNeighborhood.id);
      
      try {
        // Start with the neighborhood creator since we know they're definitely a member
        const creatorId = currentNeighborhood.created_by;
        let userIds = [creatorId]; // Start with the creator
        
        console.log("[useNeighborUsers] Adding neighborhood creator to member list:", creatorId);
        
        // Then use our security definer function to get other members
        try {
          // We need to use the rpc approach to call our custom database function
          const { data: memberIds, error: rpcError } = await supabase.rpc('get_neighborhood_members', {
            neighborhood_uuid: currentNeighborhood.id
          });
          
          if (rpcError) {
            console.warn("[useNeighborUsers] RPC call failed, using fallback approach:", rpcError);
            // Fallback - at least we have the creator
          } else if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
            // We got member IDs from the RPC function - they come as an array
            console.log("[useNeighborUsers] Found members via RPC:", {
              count: memberIds.length
            });
            userIds = [...new Set([...userIds, ...memberIds])]; // Combine and deduplicate
          } else {
            console.log("[useNeighborUsers] No additional members found via RPC");
          }
        } catch (rpcError) {
          console.warn("[useNeighborUsers] Error calling RPC:", rpcError);
          // Continue with just the creator as fallback
        }
        
        console.log("[useNeighborUsers] Final list of user IDs to fetch:", {
          count: userIds.length,
          firstFewIds: userIds.slice(0, 3) // Log first few for debugging
        });

        // Fetch profiles for these users
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, address, email_visible, phone_visible, address_visible, needs_visible, phone_number, access_needs, bio')
          .in('id', userIds);

        if (profilesError) {
          console.error("[useNeighborUsers] Error fetching profiles:", profilesError);
          throw profilesError;
        }

        console.log("[useNeighborUsers] Profiles fetched:", {
          count: profiles?.length || 0
        });

        // Fetch user emails
        const { data: authUsers, error: authError } = await supabase
          .from('auth_users_view')
          .select('id, email, created_at')
          .in('id', userIds);

        if (authError) {
          console.error("[useNeighborUsers] Error fetching auth users:", authError);
          throw authError;
        }

        console.log("[useNeighborUsers] Auth users fetched:", {
          count: authUsers?.length || 0
        });

        // Fetch user roles
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);

        if (rolesError) {
          console.error("[useNeighborUsers] Error fetching user roles:", rolesError);
          throw rolesError;
        }

        // Combine all the data
        const usersWithProfiles = profiles.map((profile: any) => {
          // Find the matching auth user data for this profile
          const authUser = authUsers.find((u: any) => u.id === profile.id);
          
          // Find all roles for this user
          const roles = userRoles
            .filter((r: any) => r.user_id === profile.id)
            .map((r: any) => r.role as UserWithRole['roles'][0]);

          // Create the combined user object
          return {
            id: profile.id,
            email: authUser?.email,
            created_at: authUser?.created_at,
            roles: roles,
            profiles: {
              display_name: profile.display_name,
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

        console.log("[useNeighborUsers] Final combined users:", {
          count: usersWithProfiles.length
        });
        
        return usersWithProfiles as UserWithRole[];
      } catch (error) {
        // Log detailed error information and rethrow
        console.error("[useNeighborUsers] Critical error in data fetching:", error);
        throw error;
      }
    },
    // Only enable the query when we have a neighborhood ID
    enabled: !!currentNeighborhood?.id
  });
};
