
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
        // First, fetch all members of the current neighborhood
        console.log("[useNeighborUsers] Step 1: Fetching members of the neighborhood");
        const { data: members, error: membersError } = await supabase
          .from('neighborhood_members')
          .select('user_id')
          .eq('neighborhood_id', currentNeighborhood.id)
          .eq('status', 'active');

        if (membersError) {
          console.error("[useNeighborUsers] Error fetching neighborhood members:", {
            error: membersError,
            neighborhoodId: currentNeighborhood.id
          });
          throw membersError;
        }

        if (!members || members.length === 0) {
          console.log("[useNeighborUsers] No members found in this neighborhood");
          return [];
        }

        console.log("[useNeighborUsers] Neighborhood members found:", {
          count: members.length,
          memberIds: members.map(m => m.user_id)
        });

        // Get the list of user IDs from members
        const userIds = members.map(member => member.user_id);

        // Use a different approach to get users that avoids the recursive RLS policy
        // First, get profiles for all users
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

        // Then get user emails from auth_users_view
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

        // Then get user roles
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

        // Combine the data
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
          users: usersWithProfiles.map(u => u.id)
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
