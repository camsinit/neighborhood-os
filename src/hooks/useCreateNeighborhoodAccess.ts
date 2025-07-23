
import { useMemo } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useNeighborhood } from '@/contexts/neighborhood';

/**
 * Hook to determine if the current user has access to create neighborhoods
 * 
 * Access is granted only to users who have NO existing neighborhood.
 * This ensures neighbors who are already members cannot see the create button.
 */
export const useCreateNeighborhoodAccess = () => {
  const user = useUser();
  const { currentNeighborhood } = useNeighborhood(); // Use simplified context
  

  // Determine if user has access to create neighborhoods
  const hasAccess = useMemo(() => {
    if (!user?.id) return false;
    
    // Check if user has NO existing neighborhood (main condition for all users)
    const hasNoNeighborhood = !currentNeighborhood;
    
    // Regular neighbors should not see the button if they already have a neighborhood
    // Only users without a neighborhood can create one
    return hasNoNeighborhood;
  }, [user?.id, currentNeighborhood]);

  return {
    hasAccess,
    isLoading: !user, // Simple loading state
  };
};
