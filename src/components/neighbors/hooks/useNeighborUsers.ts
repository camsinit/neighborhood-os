
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserWithRole } from "@/types/roles";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";

export const useNeighborUsers = () => {
  const { currentNeighborhood } = useNeighborhood();

  // Add initial debugging for neighborhood context
  console.log("[useNeighborUsers] Starting hook with neighborhood:", {
    neighborhoodId: currentNeighborhood?.id,
    neighborhoodName: currentNeighborhood?.name,
    timestamp: new Date().toISOString()
  });

  return useQuery({
    queryKey: ['users-with-roles', currentNeighborhood?.id],
    queryFn: async () => {
      if (!currentNeighborhood?.id) {
        // No neighborhood found, return empty array early
        console.log("[useNeighborUsers] No neighborhood found, skipping fetch");
        return [];
      }

      console.log("[useNeighborUsers] Fetching users for neighborhood:", currentNeighborhood.id);

      try {
        // Use a two-step approach to avoid recursive RLS policies
        // Step 1: First get all user IDs that belong to the neighborhood
        console.log("[useNeighborUsers] Step 1: Getting user IDs from neighborhood_members directly");
        const { data: memberIds, error: memberIdsError } = await supabase
          .from('neighborhood_members')
          .select('user_id')
          .eq('neighborhood_id', currentNeighborhood.id)
          .eq('status', 'active');

        if (memberIdsError) {
          console.error("[useNeighborUsers] Error fetching neighborhood member IDs:", {
            error: memberIdsError,
            neighborhoodId: currentNeighborhood.id
          });
          throw memberIdsError;
        }

        if (!memberIds || memberIds.length === 0) {
          console.log("[useNeighborUsers] No members found in this neighborhood");
          return [];
        }

        // Extract just the user IDs from the member results
        const userIds = memberIds.map(member => member.user_id);
        
        console.log("[useNeighborUsers] Found user IDs:", {
          count: userIds.length,
          userIds
        });

        // Step 2: Now fetch profiles for these specific user IDs
        console.log("[useNeighborUsers] Step 2: Fetching profiles for neighborhood members");
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, address, email_visible, phone_visible, address_visible, needs_visible, phone_number, access_needs, bio')
          .in('id', userIds);

        if (profilesError) {
          console.error("[useNeighborUsers] Error fetching profiles:", profilesError);
          throw profilesError;
        }

        console.log("[useNeighborUsers] Profiles result:", {
          count: profiles?.length || 0
        });

        // Step 3: Fetch user emails
        console.log("[useNeighborUsers] Step 3: Fetching user emails");
        const { data: authUsers, error: authError } = await supabase
          .from('auth_users_view')
          .select('id, email, created_at')
          .in('id', userIds);

        if (authError) {
          console.error("[useNeighborUsers] Error fetching auth users:", authError);
          throw authError;
        }

        console.log("[useNeighborUsers] Auth users result:", {
          count: authUsers?.length || 0
        });

        // Step 4: Fetch user roles
        console.log("[useNeighborUsers] Step 4: Fetching user roles");
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);

        if (rolesError) {
          console.error("[useNeighborUsers] Error fetching user roles:", rolesError);
          throw rolesError;
        }

        console.log("[useNeighborUsers] User roles result:", {
          count: userRoles?.length || 0
        });

        // Step 5: Combine the data
        console.log("[useNeighborUsers] Step 5: Combining data");
        const usersWithProfiles = profiles.map((profile: any) => {
          const authUser = authUsers.find((u: any) => u.id === profile.id);
          const roles = userRoles
            .filter((r: any) => r.user_id === profile.id)
            .map((r: any) => r.role as UserWithRole['roles'][0]);

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
          count: usersWithProfiles.length,
          users: usersWithProfiles.map(u => ({
            id: u.id, 
            displayName: u.profiles?.display_name
          }))
        });
        
        return usersWithProfiles as UserWithRole[];
      } catch (error) {
        // Log the error and rethrow for the query to handle
        console.error("[useNeighborUsers] Critical error in data fetching:", error);
        throw error;
      }
    },
    enabled: !!currentNeighborhood?.id
  });
};
