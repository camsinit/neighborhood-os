
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserWithRole, UserRole } from "@/types/roles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Shield } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading";

export const UserDirectory = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      // First get all users from auth.users through profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url');

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
            avatar_url: profile.avatar_url
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
      <div className="space-y-6">
        {users?.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={user.profiles?.avatar_url || ''} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">
                  {user.profiles?.display_name || user.email}
                </h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
          </div>
        ))}
      </div>
    </div>
  );
};
