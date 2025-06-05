
import { useMemo } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useNeighborhood } from '@/contexts/neighborhood';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to determine if the current user has access to create neighborhoods
 * 
 * UPDATED: Access is now granted only to users who:
 * - Have NO existing neighborhood (neither created nor joined)
 * - Have the specific user ID: 74bf3085-8275-4eb2-a721-8c8e91b3d3d8 (for testing)
 * - Have the 'super_admin' role
 */
export const useCreateNeighborhoodAccess = () => {
  const user = useUser();
  const { currentNeighborhood } = useNeighborhood(); // Use simplified context
  
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
    
    // Check if user is the specific authorized user (for testing)
    const isSpecialUser = user.id === '74bf3085-8275-4eb2-a721-8c8e91b3d3d8';
    
    // Check if user has super_admin role
    const isSuperAdmin = userRoles.includes('super_admin');
    
    // Check if user has NO existing neighborhood (the main condition)
    const hasNoNeighborhood = !currentNeighborhood;
    
    // User can create if they're special, super admin, OR have no neighborhood
    return isSpecialUser || isSuperAdmin || hasNoNeighborhood;
  }, [user?.id, currentNeighborhood, userRoles]);

  return {
    hasAccess,
    isLoading: !user, // Simple loading state
  };
};
