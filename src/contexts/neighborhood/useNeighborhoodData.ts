
/**
 * Main neighborhood data hook
 * 
 * This hook has been simplified to remove core contributor functionality.
 */
import { User } from '@supabase/supabase-js';
import { useNeighborhoodStatus } from './hooks/useNeighborhoodStatus';
import { useFetchNeighborhood } from './hooks/useFetchNeighborhood';
import { useAuthStabilizer } from './hooks/useAuthStabilizer';
import { useNeighborhoodMonitor } from './hooks/useNeighborhoodMonitor';
import { useEffect, useState, useCallback } from 'react';
import { Neighborhood } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Custom hook that handles fetching and managing neighborhood data
 * 
 * This simplified version removes core contributor functionality
 * 
 * @param user - The current authenticated user
 * @returns Object containing neighborhood data and loading state
 */
export function useNeighborhoodData(user: User | null) {
  // Initialize status tracking
  const statusHook = useNeighborhoodStatus();
  const {
    isLoading, setIsLoading,
    error, setError,
    fetchAttempts,
    refreshNeighborhoodData,
    startFetch,
    completeFetch,
    handleFetchError
  } = statusHook;
  
  // State for user neighborhoods
  const [userNeighborhoods, setUserNeighborhoods] = useState<Neighborhood[]>([]);
  
  // Wait for auth to stabilize
  const isAuthStable = useAuthStabilizer(user);
  
  // Initialize neighborhood data fetching - simplified version
  const neighborhoodHook = useFetchNeighborhood(
    isAuthStable ? user : null,
    fetchAttempts,
    { startFetch, completeFetch, handleFetchError, setIsLoading }
  );
  const {
    currentNeighborhood,
    setCurrentNeighborhood,
    fetchNeighborhood
  } = neighborhoodHook;

  // Function to fetch user's neighborhoods
  const fetchUserNeighborhoods = useCallback(async () => {
    if (!user?.id) {
      setUserNeighborhoods([]);
      return;
    }

    try {
      // Fetch all neighborhoods the user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from('neighborhood_members')
        .select(`
          neighborhood_id,
          neighborhoods:neighborhood_id (
            id,
            name,
            created_by
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (memberError) {
        console.error('Error fetching user neighborhoods:', memberError);
        return;
      }

      // Extract neighborhood data from the join
      const neighborhoods = memberData
        ?.map(member => member.neighborhoods)
        .filter(Boolean) as Neighborhood[];

      setUserNeighborhoods(neighborhoods || []);
    } catch (error) {
      console.error('Error in fetchUserNeighborhoods:', error);
    }
  }, [user?.id]);

  // Function to switch to a different neighborhood
  const switchNeighborhood = useCallback(async (neighborhoodId: string) => {
    const targetNeighborhood = userNeighborhoods.find(n => n.id === neighborhoodId);
    if (targetNeighborhood) {
      setCurrentNeighborhood(targetNeighborhood);
      toast.success(`Switched to ${targetNeighborhood.name}`);
    }
  }, [userNeighborhoods, setCurrentNeighborhood]);
  
  // Set up monitoring and safety timeouts - removed core contributor parameters
  useNeighborhoodMonitor({
    currentNeighborhood,
    isLoading,
    error,
    user,
    fetchAttempts,
    setIsLoading,
    setError
  });

  // Main effect to fetch neighborhood data
  useEffect(() => {
    // Call the fetch function when the user/fetchAttempts changes
    // and auth state is stable
    if (isAuthStable) {
      fetchNeighborhood();
      fetchUserNeighborhoods();
    }
  }, [isAuthStable, user, fetchAttempts, fetchNeighborhood, fetchUserNeighborhoods]);

  // Return updated state and functions
  return { 
    currentNeighborhood,
    userNeighborhoods, // Include userNeighborhoods in return
    isLoading, 
    error,
    setCurrentNeighborhood,
    switchNeighborhood, // Include switchNeighborhood function
    refreshNeighborhoodData
  };
}
