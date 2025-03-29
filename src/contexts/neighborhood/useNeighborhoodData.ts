
/**
 * Main neighborhood data hook
 * 
 * This hook combines smaller, focused hooks to provide neighborhood data
 * functionality throughout the application.
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
 * This enhanced version handles the RLS recursion issue by using 
 * security definer functions and adds fallback mechanisms
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
  
  // Initialize neighborhood data fetching
  const neighborhoodHook = useFetchNeighborhood(
    isAuthStable ? user : null,
    fetchAttempts,
    { startFetch, completeFetch, handleFetchError, setIsLoading }
  );
  const {
    currentNeighborhood,
    isCoreContributor,
    allNeighborhoods,
    setCurrentNeighborhood,
    fetchNeighborhood
  } = neighborhoodHook;
  
  // Set up monitoring and safety timeouts
  useNeighborhoodMonitor({
    currentNeighborhood,
    isLoading,
    error,
    isCoreContributor,
    allNeighborhoods,
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

  // Return combined state and functions from all hooks
  return { 
    currentNeighborhood, 
    isLoading, 
    error,
    isCoreContributor,
    allNeighborhoods,
    setCurrentNeighborhood,
    refreshNeighborhoodData
  };
}
