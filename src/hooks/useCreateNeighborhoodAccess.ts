
import { useMemo } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useNeighborhood } from '@/contexts/neighborhood';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to determine if the current user has access to create neighborhoods
 * 
 * Access is granted to users who:
 * - Are part of multiple neighborhoods (>1)
 * - Have the specific user ID: 74bf3085-8275-4eb2-a721-8c8e91b3d3d8
 * - Have the 'super_admin' role
 */
export const useCreateNeighborhoodAccess = () => {
  const user = useUser();
  const { userNeighborhoods } = useNeighborhood();
  
  // Query user roles to check for super_admin access
  const { data: userRoles = [] } = useQuery({
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

  // Determine if user has access to create neighborhoods
  const hasAccess = useMemo(() => {
    if (!user?.id) return false;
    
    // Check if user is the specific authorized user
    const isSpecialUser = user.id === '74bf3085-8275-4eb2-a721-8c8e91b3d3d8';
    
    // Check if user is part of multiple neighborhoods
    const hasMultipleNeighborhoods = userNeighborhoods && userNeighborhoods.length > 1;
    
    // Check if user has super_admin role
    const isSuperAdmin = userRoles.includes('super_admin');
    
    return isSpecialUser || hasMultipleNeighborhoods || isSuperAdmin;
  }, [user?.id, userNeighborhoods, userRoles]);

  return {
    hasAccess,
    isLoading: !user, // Simple loading state
  };
};
