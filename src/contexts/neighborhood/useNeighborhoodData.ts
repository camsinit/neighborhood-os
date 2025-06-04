
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

  // Function to fetch user's neighborhoods using direct queries
  const fetchUserNeighborhoods = useCallback(async () => {
    if (!user?.id) {
      setUserNeighborhoods([]);
      return;
    }

    // Add debugging for the problematic user
    if (user.id === '74bf3085-8275-4eb2-a721-8c8e91b3d3d8') {
      console.log('[DEBUG - User 74bf...] fetchUserNeighborhoods called');
    }

    try {
      // First, get neighborhoods the user created
      const { data: createdNeighborhoods, error: createdError } = await supabase
        .from('neighborhoods')
        .select('id, name, created_by')
        .eq('created_by', user.id);

      if (createdError) {
        console.error('Error fetching created neighborhoods:', createdError);
        return;
      }

      // Then, get neighborhoods the user is a member of
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

      // Combine created neighborhoods and member neighborhoods
      const allNeighborhoods: Neighborhood[] = [
        ...(createdNeighborhoods || []),
        ...(memberData?.map(member => member.neighborhoods).filter(Boolean) || [])
      ];

      // Remove duplicates based on id
      const uniqueNeighborhoods = allNeighborhoods.filter((neighborhood, index, self) =>
        index === self.findIndex(n => n.id === neighborhood.id)
      );

      // Add debugging for the problematic user
      if (user.id === '74bf3085-8275-4eb2-a721-8c8e91b3d3d8') {
        console.log('[DEBUG - User 74bf...] fetchUserNeighborhoods results:', {
          createdNeighborhoods,
          memberData,
          allNeighborhoods,
          uniqueNeighborhoods,
          currentNeighborhood,
          timestamp: new Date().toISOString()
        });
      }

      setUserNeighborhoods(uniqueNeighborhoods);
    } catch (error) {
      console.error('Error in fetchUserNeighborhoods:', error);
    }
  }, [user?.id, currentNeighborhood]);

  // Function to switch to a different neighborhood
  const switchNeighborhood = useCallback(async (neighborhoodId: string) => {
    const targetNeighborhood = userNeighborhoods.find(n => n.id === neighborhoodId);
    if (targetNeighborhood) {
      // Add debugging for the problematic user
      if (user?.id === '74bf3085-8275-4eb2-a721-8c8e91b3d3d8') {
        console.log('[DEBUG - User 74bf...] switchNeighborhood called:', {
          targetNeighborhoodId: neighborhoodId,
          targetNeighborhood,
          previousNeighborhood: currentNeighborhood,
          timestamp: new Date().toISOString()
        });
      }
      
      setCurrentNeighborhood(targetNeighborhood);
      toast.success(`Switched to ${targetNeighborhood.name}`);
    }
  }, [userNeighborhoods, setCurrentNeighborhood, currentNeighborhood, user?.id]);
  
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
