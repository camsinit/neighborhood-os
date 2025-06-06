
/**
 * Hook to check if the current user has Super Admin access
 * 
 * This hook queries the user_roles table to determine if the current user
 * has the 'super_admin' role, which grants access to the Debug page.
 */
import { useMemo } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSuperAdminAccess = () => {
  const user = useUser();
  
  // Query user roles to check for super_admin access
  const { data: userRoles = [], isLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      return data.map(row => row.role);
    },
    enabled: !!user?.id,
  });

  // Determine if user has super admin access
  const isSuperAdmin = useMemo(() => {
    return userRoles.includes('super_admin');
  }, [userRoles]);

  return {
    isSuperAdmin,
    isLoading: isLoading || !user, // Loading if query is running or no user yet
  };
};
