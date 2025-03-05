
/**
 * Updated useNeighborUsers hook to use the new neighborhood context
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserWithRole } from "@/types/roles";
import { useNeighborhood } from "@/hooks/useNeighborhood";

/**
 * Custom hook that fetches users in the current neighborhood
 * 
 * This updated version uses the simplified neighborhood hook system
 */
export const useNeighborUsers = () => {
  // Get the current neighborhood from our new hook
  const { neighborhood, isLoading: isLoadingNeighborhood } = useNeighborhood();

  return useQuery({
    // Include neighborhood ID in query key for automatic refetching when it changes
    queryKey: ['users-with-roles', neighborhood?.id],
    queryFn: async () => {
      // If no neighborhood found, return an empty array
      if (!neighborhood?.id) {
        console.log("[useNeighborUsers] No neighborhood found, returning empty array");
        return [];
      }
      
      try {
        console.log("[useNeighborUsers] Fetching users for neighborhood:", neighborhood.id);
        
        // Use the view we created to simplify fetching neighborhood members with profiles
        const { data: members, error: membersError } = await supabase
          .from('neighborhood_members_with_profiles')
          .select('*')
          .eq('neighborhood_id', neighborhood.id);
          
        if (membersError) {
          console.error("[useNeighborUsers] Error fetching members:", membersError);
          throw membersError;
        }
        
        // Get the user emails from auth_users_view
        const userIds = members.map(m => m.user_id);
        const { data: authUsers, error: authError } = await supabase
          .from('auth_users_view')
          .select('id, email, created_at')
          .in('id', userIds);
          
        if (authError) {
          console.error("[useNeighborUsers] Error fetching auth users:", authError);
          // Continue anyway, just without emails
        }
        
        console.log("[useNeighborUsers] Found neighbors:", {
          memberCount: members.length,
          authUsersCount: authUsers?.length || 0
        });
        
        // Transform the data into the expected format
        const usersWithRoles = members.map((member: any) => {
          const authUser = authUsers?.find((u: any) => u.id === member.user_id);
          
          return {
            id: member.user_id,
            email: authUser?.email,
            created_at: authUser?.created_at,
            roles: ['user'], // Default role
            profiles: {
              display_name: member.display_name || 'Neighbor',
              avatar_url: member.avatar_url,
              address: member.address,
              phone_number: member.phone_number,
              access_needs: member.access_needs,
              email_visible: member.email_visible,
              phone_visible: member.phone_visible,
              address_visible: member.address_visible,
              needs_visible: member.needs_visible,
              bio: member.bio
            }
          };
        });
        
        return usersWithRoles as UserWithRole[];
      } catch (error) {
        console.error("[useNeighborUsers] Error in data fetching:", error);
        throw error;
      }
    },
    // Only enable the query when we have a neighborhood
    enabled: !!neighborhood?.id && !isLoadingNeighborhood
  });
};
