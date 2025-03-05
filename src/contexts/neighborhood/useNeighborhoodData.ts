
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from './types';
import { supabase } from '@/integrations/supabase/client';

// Import our refactored hooks
import { useNeighborhoodRefresh } from './hooks/useNeighborhoodRefresh';
import { useNeighborhoodSafetyTimeout } from './hooks/useNeighborhoodSafetyTimeout';
import { useFetchNeighborhood } from './hooks/fetch/useFetchNeighborhood'; // Updated path to the refactored module
import { useNeighborhoodLogging } from './hooks/useNeighborhoodLogging';
import { useSafetyTimeouts } from './hooks/useSafetyTimeouts';

/**
 * Custom hook that handles fetching and managing neighborhood data
 * 
 * This improved version uses smaller, focused hooks to handle different aspects
 * of neighborhood data management. It avoids the RLS recursion issue by using 
 * security definer functions to safely fetch neighborhood information.
 * 
 * @param user - The current authenticated user
 * @returns Object containing neighborhood data and loading state
 */
export function useNeighborhoodData(user: User | null) {
  // State variables to track the neighborhood data and loading status
  const [currentNeighborhood, setCurrentNeighborhood] = useState<Neighborhood | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for God Mode functionality
  const [isCoreContributor, setIsCoreContributor] = useState(false);
  const [allNeighborhoods, setAllNeighborhoods] = useState<Neighborhood[]>([]);
  
  // Use our refresh hook to manage refresh functionality
  const { fetchAttempts, refreshNeighborhoodData } = useNeighborhoodRefresh();
  
  // Track if we have attempted a fetch
  const [hasFetchAttempted, setHasFetchAttempted] = useState(false);
  
  // Use our fetch neighborhood hook for the main data fetching logic
  const { fetchNeighborhood, error, setError } = useFetchNeighborhood(
    user, 
    currentNeighborhood, 
    fetchAttempts
  );
  
  // Use our safety timeout hook to manage fetch timeouts
  const { startFetchTimer, endFetchTimer } = useNeighborhoodSafetyTimeout(
    isLoading,
    hasFetchAttempted
  );
  
  // Add safety timeout to prevent infinite loading
  useSafetyTimeouts(isLoading, setIsLoading, setError);
  
  // Fetch neighborhood data when dependencies change
  useEffect(() => {
    // Add additional logging for supabase client check
    if (!supabase || !supabase.rpc) {
      console.error("[useNeighborhoodData] Supabase client is invalid:", { 
        supabaseExists: !!supabase,
        rpcExists: !!(supabase && supabase.rpc),
        fetchAttempt: fetchAttempts
      });
      setError(new Error("Supabase client is not properly initialized"));
      setIsLoading(false);
      return;
    }
    
    // Call the fetch function when the component mounts or user/fetchAttempts changes
    fetchNeighborhood(
      startFetchTimer,
      endFetchTimer,
      setIsLoading,
      setIsCoreContributor,
      setAllNeighborhoods,
      setCurrentNeighborhood
    );
  }, [
    user, 
    fetchAttempts, 
    fetchNeighborhood, 
    startFetchTimer, 
    endFetchTimer, 
    setError
  ]);
  
  // Use our additional safety check for loading state
  useEffect(() => {
    if (hasFetchAttempted && isLoading) {
      const forceLoadingOffTimer = setTimeout(() => {
        if (isLoading) {
          console.warn("[useNeighborhoodData] Forcing loading state to false after timeout");
          setIsLoading(false);
        }
      }, 5000); // 5 second backup timeout
      
      return () => {
        clearTimeout(forceLoadingOffTimer);
      };
    }
  }, [hasFetchAttempted, isLoading]);
  
  // Log state changes for debugging
  useNeighborhoodLogging({
    currentNeighborhood,
    isLoading,
    error,
    isCoreContributor,
    allNeighborhoods,
    user,
    fetchAttempts
  });

  // Return the same interface as before to maintain compatibility
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
