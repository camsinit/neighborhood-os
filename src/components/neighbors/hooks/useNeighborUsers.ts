
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserWithRole } from "@/types/roles";
import { useNeighborhood } from "@/contexts/neighborhood";

/**
 * Custom hook that fetches users in the current neighborhood
 * 
 * UPDATED: Now works with simplified RLS policies - uses view that handles access control
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
        console.log("[useNeighborUsers] No neighborhood found, returning empty array");
        return [];
      }

      console.log("[useNeighborUsers] Fetching users for neighborhood:", currentNeighborhood.id);
      
      try {
        // UPDATED: Use the view directly - it should handle access through the user's membership
        const { data: neighborsData, error } = await supabase
          .from('neighborhood_members_with_profiles')
          .select('*')
          .eq('neighborhood_id', currentNeighborhood.id)
          .eq('status', 'active');
          
        if (error) {
          console.error("[useNeighborUsers] Error fetching neighborhood members:", error);
          throw error;
        }
        
        console.log("[useNeighborUsers] Found neighbors:", {
          memberCount: neighborsData?.length || 0,
          neighborhoodId: currentNeighborhood.id
        });
        
        // Get auth details (emails) for the users - only if we have neighbors
        if (!neighborsData || neighborsData.length === 0) {
          return [];
        }

        const userIds = neighborsData.map(n => n.user_id);
        
        const { data: authUsers, error: authError } = await supabase
          .from('auth_users_view')
          .select('id, email, created_at')
          .in('id', userIds);
          
        if (authError) {
          console.error("[useNeighborUsers] Error fetching auth users:", authError);
          // Continue without auth data rather than failing completely
        }
        
        // Transform data into expected format
        const usersWithProfiles = neighborsData.map((neighbor: any) => {
          const authUser = authUsers?.find((u: any) => u.id === neighbor.user_id);
          
          return {
            id: neighbor.user_id,
            email: authUser?.email || 'Unknown',
            created_at: authUser?.created_at,
            roles: ['user'], // Default role
            profiles: {
              display_name: neighbor.display_name || 'Neighbor',
              avatar_url: neighbor.avatar_url,
              address: neighbor.address,
              phone_number: neighbor.phone_number,
              access_needs: neighbor.access_needs,
              email_visible: neighbor.email_visible,
              phone_visible: neighbor.phone_visible,
              address_visible: neighbor.address_visible,
              needs_visible: neighbor.needs_visible,
              bio: neighbor.bio
            }
          };
        });
        
        return usersWithProfiles as UserWithRole[];
      } catch (error) {
        console.error("[useNeighborUsers] Error in data fetching:", error);
        throw error;
      }
    },
    // Always enable the query
    enabled: !!currentNeighborhood?.id
  });
};
