
/**
 * Simplified neighborhood data hook
 * 
 * This hook has been simplified to support only one neighborhood per user.
 * Removed core contributor functionality and multiple neighborhood support.
 */
import { User } from '@supabase/supabase-js';
import { useNeighborhoodStatus } from './hooks/useNeighborhoodStatus';
import { useFetchNeighborhood } from './hooks/useFetchNeighborhood';
import { useAuthStabilizer } from './hooks/useAuthStabilizer';
import { useNeighborhoodMonitor } from './hooks/useNeighborhoodMonitor';
import { useEffect } from 'react';
import { Neighborhood } from './types';

/**
 * Custom hook that handles fetching and managing neighborhood data
 * 
 * Simplified version that supports only one neighborhood per user
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

  // Add debugging for the problematic user
  useEffect(() => {
    if (user?.id === '74bf3085-8275-4eb2-a721-8c8e91b3d3d8') {
      console.log('[DEBUG - User 74bf...] useNeighborhoodData - single neighborhood mode:', {
        currentNeighborhood,
        isLoading,
        error,
        timestamp: new Date().toISOString()
      });
    }
  }, [currentNeighborhood, isLoading, error, user?.id]);
  
  // Set up monitoring and safety timeouts - simplified parameters
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
    }
  }, [isAuthStable, user, fetchAttempts, fetchNeighborhood]);

  // Return simplified state and functions
  return { 
    currentNeighborhood,
    isLoading, 
    error,
    setCurrentNeighborhood,
    refreshNeighborhoodData
  };
}
