
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserWithRole } from "@/types/roles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MapPin } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading";
import { Card, CardContent } from "@/components/ui/card";

export const UserDirectory = () => {
  // Query to fetch users and their profiles
  const {
    data: users,
    isLoading
  } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      // First get all users from auth.users through profiles
      const {
        data: profiles,
        error: profilesError
      } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, address, email_visible, phone_visible, address_visible, needs_visible, phone_number, access_needs');
      if (profilesError) throw profilesError;

      // Then get user emails from auth.users
      const {
        data: authUsers,
        error: authError
      } = await supabase.from('auth_users_view').select('id, email, created_at');
      if (authError) throw authError;

      // Combine the data
      const usersWithProfiles = profiles.map((profile: any) => {
        const authUser = authUsers.find((u: any) => u.id === profile.id);
        return {
          id: profile.id,
          email: authUser?.email,
          created_at: authUser?.created_at,
          profiles: {
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            address: profile.address_visible ? profile.address : null,
            phone_number: profile.phone_visible ? profile.phone_number : null,
            access_needs: profile.needs_visible ? profile.access_needs : null,
            email_visible: profile.email_visible,
            phone_visible: profile.phone_visible,
            address_visible: profile.address_visible,
            needs_visible: profile.needs_visible
          }
        };
      });
      return usersWithProfiles as UserWithRole[];
    }
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {users?.map(user => (
          <Card key={user.id} className="overflow-hidden hover:shadow-md transition-shadow">
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
                  
                  {/* Only show email if user has allowed it */}
                  {user.profiles?.email_visible && (
                    <p className="text-sm text-gray-500 truncate max-w-[150px]">{user.email}</p>
                  )}

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
    </div>
  );
};
