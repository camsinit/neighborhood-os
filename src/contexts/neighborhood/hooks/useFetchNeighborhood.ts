
/**
 * Hook for fetching neighborhood data
 *
 * This version uses our security definer functions to avoid recursion.
 */
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '../types';
import { 
  fetchAllNeighborhoods,
  fetchCreatedNeighborhoods,
  fetchUserMemberships
} from '../utils/neighborhoodFetchUtils';
import { supabase } from '@/integrations/supabase/client';

/**
 * Custom hook that focuses on fetching neighborhood data
 * 
 * @param user - The current authenticated user
 * @param fetchAttempts - Counter that triggers new fetch attempts
 * @param statusFunctions - Functions to update loading/error status
 * @returns Object containing neighborhood data
 */
export function useFetchNeighborhood(
  user: User | null,
  fetchAttempts: number,
  { 
    startFetch, 
    completeFetch, 
    handleFetchError,
    setIsLoading
  }: {
    startFetch: () => number;
    completeFetch: (startTime: number) => void;
    handleFetchError: (err: any, startTime?: number) => void;
    setIsLoading: (isLoading: boolean) => void;
  }
) {
  // State for neighborhood data
  const [currentNeighborhood, setCurrentNeighborhood] = useState<Neighborhood | null>(null);

  // The main fetch function that retrieves neighborhood data
  const fetchNeighborhood = useCallback(async () => {
    // Skip if no user is logged in
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Start timing and tracking the fetch operation
    const startTime = startFetch();
    
    try {
      // If we already have a current neighborhood, we're done
      if (currentNeighborhood) {
        completeFetch(startTime);
        return;
      }

      console.log(`[useFetchNeighborhood] Fetching neighborhoods for user ${user.id} (attempt ${fetchAttempts})`);

      // First try to get all user neighborhoods using our RPC function
      const neighborhoods = await fetchAllNeighborhoods();
      
      if (neighborhoods && neighborhoods.length > 0) {
        console.log("[useFetchNeighborhood] Found neighborhoods via RPC:", neighborhoods);
        setCurrentNeighborhood(neighborhoods[0]);
        completeFetch(startTime);
        return;
      }
      
      console.log("[useFetchNeighborhood] No neighborhoods found (attempt " + fetchAttempts + ")");
      setCurrentNeighborhood(null);
      
      // Always ensure loading is set to false when done
      completeFetch(startTime);
      
    } catch (err) {
      // Handle unexpected errors
      handleFetchError(err, startTime);
      
      // Reset current neighborhood in case of error
      setCurrentNeighborhood(null);
    }
  }, [
    user, 
    fetchAttempts, 
    currentNeighborhood,
    startFetch,
    completeFetch,
    handleFetchError,
    setIsLoading
  ]);

  // Return data and functions
  return {
    currentNeighborhood,
    setCurrentNeighborhood,
    fetchNeighborhood
  };
}
