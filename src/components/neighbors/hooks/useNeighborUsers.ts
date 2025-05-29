
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserWithRole } from "@/types/roles";
import { useNeighborhood } from "@/contexts/neighborhood";

/**
 * Custom hook that fetches users in the current neighborhood
 * 
 * UPDATED: Now uses direct table queries instead of the dropped security definer view
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
        // First, get neighborhood members using direct table query
        const { data: membersData, error: membersError } = await supabase
          .from('neighborhood_members')
          .select('user_id')
          .eq('neighborhood_id', currentNeighborhood.id)
          .eq('status', 'active');
          
        if (membersError) {
          console.error("[useNeighborUsers] Error fetching neighborhood members:", membersError);
          throw membersError;
        }
        
        if (!membersData || membersData.length === 0) {
          console.log("[useNeighborUsers] No members found in neighborhood");
          return [];
        }

        console.log("[useNeighborUsers] Found members:", {
          memberCount: membersData.length,
          neighborhoodId: currentNeighborhood.id
        });
        
        // Get user IDs for profile lookup
        const userIds = membersData.map(m => m.user_id);
        
        // Get profiles for these users using direct table query
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, address, phone_number, access_needs, email_visible, phone_visible, address_visible, needs_visible, bio')
          .in('id', userIds);
          
        if (profilesError) {
          console.error("[useNeighborUsers] Error fetching profiles:", profilesError);
          throw profilesError;
        }
        
        // Transform data into expected format
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
