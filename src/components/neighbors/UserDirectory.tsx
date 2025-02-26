import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserWithRole } from "@/types/roles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MapPin, Phone } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";

interface UserDirectoryProps {
  searchQuery?: string;
}

export const UserDirectory = ({ searchQuery = "" }: UserDirectoryProps) => {
  // State to track which user's profile is being viewed
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const { currentNeighborhood } = useNeighborhood();

  // Query to fetch users and their profiles
  const {
    data: users,
    isLoading
  } = useQuery({
    // Include neighborhood in query key to refetch when it changes
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

  // Filter users based on search query
  const filteredUsers = users?.filter(user => 
    searchQuery === "" || 
    user.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.profiles?.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      {/* Grid of neighbor cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredUsers?.map(user => (
          <Card 
            key={user.id} 
            data-neighbor-id={user.id}
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedUser(user)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center space-y-3">
                {/* Avatar */}
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.profiles?.avatar_url || ''} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="text-center space-y-1">
                  <h3 className="font-medium text-base truncate max-w-[150px]">
                    {user.profiles?.display_name || 'Neighbor'}
                  </h3>
                  
                  {/* Always show email since it's required */}
                  <p className="text-sm text-gray-500 truncate max-w-[150px]">{user.email}</p>

                  {/* Only show address if user has allowed it */}
                  {user.profiles?.address_visible && user.profiles?.address && (
                    <div className="flex items-center justify-center text-xs text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate max-w-[120px]">{user.profiles.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Neighbor Profile</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedUser.profiles?.avatar_url || ''} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">
                    {selectedUser.profiles?.display_name || 'Neighbor'}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              {/* Bio Section */}
              {selectedUser.profiles?.bio && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">About</h3>
                  <p className="text-sm">{selectedUser.profiles.bio}</p>
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                <div className="space-y-2">
                  {selectedUser.profiles?.phone_visible && selectedUser.profiles?.phone_number && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{selectedUser.profiles.phone_number}</span>
                    </div>
                  )}
                  
                  {selectedUser.profiles?.address_visible && selectedUser.profiles?.address && (
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{selectedUser.profiles.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Access Needs */}
              {selectedUser.profiles?.needs_visible && selectedUser.profiles?.access_needs && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Access & Functional Needs</h3>
                  <p className="text-sm">{selectedUser.profiles.access_needs}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
