
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
import { useEffect } from 'react';

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
    }
  }, [isAuthStable, user, fetchAttempts, fetchNeighborhood]);

  // Return simplified state and functions (removed core contributor data)
  return { 
    currentNeighborhood, 
    isLoading, 
    error,
    setCurrentNeighborhood,
    refreshNeighborhoodData
  };
}
