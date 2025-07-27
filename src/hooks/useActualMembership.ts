/**
 * Hook to check if current user is an actual member (not just ghost admin)
 * 
 * This hook determines whether the current user has actual membership in a 
 * neighborhood, which is required for posting and engagement activities.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { useSuperAdminAccess } from './useSuperAdminAccess';

/**
 * Hook to check actual membership status in a neighborhood
 * @param neighborhoodId - The neighborhood ID to check membership for
 * @returns Object with isActualMember status and loading state
 */
export const useActualMembership = (neighborhoodId: string | null) => {
  const user = useUser();
  const { isSuperAdmin } = useSuperAdminAccess();
  
  return useQuery({
    queryKey: ['actual-membership', user?.id, neighborhoodId],
    queryFn: async (): Promise<boolean> => {
      // If no user or neighborhood, not a member
      if (!user?.id || !neighborhoodId) {
        return false;
      }
      
      // Call the is_actual_member function to check membership without super admin bypass
      const { data, error } = await supabase.rpc('is_actual_member', {
        user_uuid: user.id,
        neighborhood_uuid: neighborhoodId
      });
      
      if (error) {
        console.error('Error checking actual membership:', error);
        return false;
      }
      
      return data || false;
    },
    enabled: !!user?.id && !!neighborhoodId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

/**
 * Hook to check if current user is in "ghost mode" for a neighborhood
 * Ghost mode = super admin with view access but not actual member
 * @param neighborhoodId - The neighborhood ID to check
 * @returns Object with isGhostMode status and related flags
 */
export const useGhostMode = (neighborhoodId: string | null) => {
  const { isSuperAdmin } = useSuperAdminAccess();
  const { data: isActualMember = false, isLoading } = useActualMembership(neighborhoodId);
  
  // Ghost mode = super admin with neighborhood access but not actual member
  const isGhostMode = isSuperAdmin && !isActualMember;
  
  return {
    isGhostMode,
    isActualMember,
    isSuperAdmin,
    canPost: isActualMember, // Only actual members can post
    canView: isSuperAdmin || isActualMember, // Super admins and members can view
    isLoading
  };
};