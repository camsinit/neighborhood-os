
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserWithRole } from "@/types/roles";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";

export const useNeighborUsers = () => {
  const { currentNeighborhood } = useNeighborhood();

  return useQuery({
    queryKey: ['users-with-roles', currentNeighborhood?.id],
    queryFn: async () => {
      if (!currentNeighborhood?.id) {
        console.log("[UserDirectory] No neighborhood found, skipping fetch");
        return [];
      }

      console.log("[UserDirectory] Fetching users for neighborhood:", currentNeighborhood.id);

      // First get all users from the same neighborhood
      const { data: neighborhoodMembers, error: membersError } = await supabase
        .from('neighborhood_members')
        .select('user_id')
        .eq('neighborhood_id', currentNeighborhood.id)
        .eq('status', 'active');

      if (membersError) {
        console.error("[UserDirectory] Error fetching neighborhood members:", membersError);
        throw membersError;
      }

      if (!neighborhoodMembers?.length) {
        console.log("[UserDirectory] No members found in neighborhood");
        return [];
      }

      const memberIds = neighborhoodMembers.map(member => member.user_id);

      // Then get profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, address, email_visible, phone_visible, address_visible, needs_visible, phone_number, access_needs, bio')
        .in('id', memberIds);

      if (profilesError) {
        console.error("[UserDirectory] Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Then get user emails from auth.users
      const { data: authUsers, error: authError } = await supabase
        .from('auth_users_view')
        .select('id, email, created_at')
        .in('id', memberIds);

      if (authError) {
        console.error("[UserDirectory] Error fetching auth users:", authError);
        throw authError;
      }

      // Then get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', memberIds);

      if (rolesError) {
        console.error("[UserDirectory] Error fetching user roles:", rolesError);
        throw rolesError;
      }

      // Combine the data
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

      console.log("[UserDirectory] Found users:", usersWithProfiles.length);
      return usersWithProfiles as UserWithRole[];
    },
    enabled: !!currentNeighborhood?.id
  });
};
