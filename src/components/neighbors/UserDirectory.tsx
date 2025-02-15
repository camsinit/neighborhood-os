
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserWithRole, UserRole } from "@/types/roles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Shield, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading";
import { Card, CardContent } from "@/components/ui/card";

export const UserDirectory = () => {
  const queryClient = useQueryClient();

  // Add a query to check if current user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ['check-admin'],
    queryFn: async () => {
      const { data: isAdminResult } = await supabase.rpc('check_user_role', {
        user_id: (await supabase.auth.getUser()).data.user?.id || '',
        required_role: 'super_admin'
      });
      if (!isAdminResult) {
        const { data: isModeratorResult } = await supabase.rpc('check_user_role', {
          user_id: (await supabase.auth.getUser()).data.user?.id || '',
          required_role: 'admin'
        });
        return isModeratorResult;
      }
      return isAdminResult;
    },
    enabled: !!supabase.auth.getUser()
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      // First get all users from auth.users through profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, address');

      if (profilesError) throw profilesError;

      // Then get user emails from auth.users
      const { data: authUsers, error: authError } = await supabase
        .from('auth_users_view')
        .select('id, email, created_at');

      if (authError) throw authError;

      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine the data
      const usersWithRoles = profiles.map((profile: any) => {
        const authUser = authUsers.find((u: any) => u.id === profile.id);
        return {
          id: profile.id,
          email: authUser?.email,
          created_at: authUser?.created_at,
          profiles: {
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            address: profile.address
          },
          roles: roles?.filter(r => r.user_id === profile.id).map(r => r.role as UserRole) || ['user']
        };
      });

      return usersWithRoles as UserWithRole[];
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: UserRole }) => {
      // First remove existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Then add new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: userId, 
          role: role as 'super_admin' | 'admin' | 'moderator' | 'user'
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Role updated successfully');
    },
    onError: (error) => {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Neighbor Directory</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users?.map((user) => (
          <Card key={user.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.profiles?.avatar_url || ''} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-medium text-lg">
                    {user.profiles?.display_name || user.email}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  {user.profiles?.address && (
                    <div className="flex items-center justify-center mt-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{user.profiles.address}</span>
                    </div>
                  )}
                </div>
                
                {isAdmin && (
                  <div className="flex items-center space-x-2 mt-4">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <Select
                      value={user.roles[0] || 'user'}
                      onValueChange={(role) => {
                        updateRoleMutation.mutate({ 
                          userId: user.id, 
                          role: role as UserRole 
                        });
                      }}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
