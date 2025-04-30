
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserWithRole } from "@/types/roles";
import { useNeighborhood } from "@/contexts/neighborhood";

/**
 * Custom hook that fetches users in the current neighborhood
 * 
 * This version uses direct table access since RLS is temporarily disabled
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
          // Since RLS is disabled, we can directly query profiles
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(20);
            
          if (error) {
            console.error("[useNeighborUsers] Error fetching profiles:", error);
            throw error;
          }
          
          if (!profiles || !Array.isArray(profiles)) {
            console.warn("[useNeighborUsers] No profiles returned or invalid data format");
            return [];
          }
          
          console.log("[useNeighborUsers] Fetched profiles as fallback:", {
            count: profiles.length
          });
          
          // Create an array of IDs for the email lookup
          const userIds = profiles.map((p: any) => p.id);
          
          // Get the user emails through the auth.users_view (since RLS is disabled)
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
            const authUser = authUsers?.find((u: any) => u.id === profile.id);
            
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

      // For neighborhoods, directly query the members with a join
      console.log("[useNeighborUsers] Fetching users for neighborhood:", currentNeighborhood.id);
      
      try {
        // Since RLS is disabled, we can directly join the tables
        const { data: memberData, error: memberError } = await supabase
          .from('neighborhood_members')
          .select(`
            user_id,
            status,
            joined_at,
            profiles:user_id(
              display_name, 
              avatar_url, 
              address, 
              phone_number, 
              access_needs,
              email_visible,
              phone_visible,
              address_visible,
              needs_visible,
              bio
            ),
            users:user_id(
              email
            )
          `)
          .eq('neighborhood_id', currentNeighborhood.id)
          .eq('status', 'active');
          
        if (memberError) {
          console.error("[useNeighborUsers] Error fetching neighborhood members:", memberError);
          throw memberError;
        }
        
        if (!memberData || !Array.isArray(memberData)) {
          console.log("[useNeighborUsers] No members found or invalid data format, returning empty array");
          return [];
        }
        
        console.log("[useNeighborUsers] Found neighborhood members:", {
          memberCount: memberData.length,
          neighborhoodId: currentNeighborhood.id
        });
        
        // Transform data into expected format
        const usersWithProfiles = memberData.map((member: any) => {
          const profile = member.profiles || {};
          
          return {
            id: member.user_id,
            email: member.users?.email,
            created_at: member.joined_at,
            roles: ['user'], // Default role
            profiles: {
              display_name: profile.display_name || 'Neighbor',
              avatar_url: profile.avatar_url,
              address: profile.address_visible ? profile.address : null,
              phone_number: profile.phone_visible ? profile.phone_number : null,
              access_needs: profile.needs_visible ? profile.access_needs : null,
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
    enabled: true
  });
};
