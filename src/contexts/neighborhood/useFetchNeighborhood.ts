
/**
 * Hook for fetching neighborhood data
 *
 * This hook handles the actual data fetching logic for neighborhoods
 * and contains the core neighborhood data retrieval functionality.
 */
import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from './types';
import { 
  fetchCreatedNeighborhoods, 
  checkCoreContributorAccess,
  fetchAllNeighborhoodsForCoreContributor
} from './utils';
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
  // State variables for neighborhood data
  const [currentNeighborhood, setCurrentNeighborhood] = useState<Neighborhood | null>(null);
  const [isCoreContributor, setIsCoreContributor] = useState(false);
  const [allNeighborhoods, setAllNeighborhoods] = useState<Neighborhood[]>([]);

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
      // First check if the user is a core contributor with access to all neighborhoods
      console.log(`[useFetchNeighborhood] Checking if user is core contributor (attempt ${fetchAttempts})`);
      const isContributor = await checkCoreContributorAccess(user.id);
      setIsCoreContributor(isContributor);
      
      // If they are a core contributor, fetch all neighborhoods
      if (isContributor) {
        console.log("[useFetchNeighborhood] User is a core contributor with access to all neighborhoods", {
          fetchAttempt: fetchAttempts
        });
        
        // Fetch all neighborhoods
        const neighborhoods = await fetchAllNeighborhoodsForCoreContributor(user.id);
        setAllNeighborhoods(neighborhoods);
        
        // If we have neighborhoods and no current one is set, set the first one as current
        if (neighborhoods.length > 0 && !currentNeighborhood) {
          console.log(`[useFetchNeighborhood] Setting first neighborhood for core contributor (attempt ${fetchAttempts})`, {
            neighborhood: neighborhoods[0]
          });
          setCurrentNeighborhood(neighborhoods[0]);
          completeFetch(startTime);
          return;
        }
      }

      // If we already have a current neighborhood, we're done
      if (currentNeighborhood) {
        completeFetch(startTime);
        return;
      }

      // Check if the user has created any neighborhoods
      const { data: createdNeighborhoods, error: createdError } = await fetchCreatedNeighborhoods(user.id);
      
      if (createdError) {
        console.warn("[useFetchNeighborhood] Error getting created neighborhoods:", createdError);
      } else if (createdNeighborhoods && createdNeighborhoods.length > 0) {
        // Found created neighborhoods
        console.log("[useFetchNeighborhood] Found created neighborhoods:", createdNeighborhoods);
        setCurrentNeighborhood(createdNeighborhoods[0]);
        completeFetch(startTime);
        return;
      }
      
      // SAFE FALLBACK: Try direct membership
      try {
        // Get direct membership
        const { data: memberships, error: membershipError } = await supabase
          .from('neighborhood_members')
          .select('neighborhood_id')
          .eq('user_id', user.id)
          .eq('status', 'active');
        
        if (membershipError) {
          console.warn("[useFetchNeighborhood] Error getting neighborhood memberships:", membershipError);
        } else if (memberships && memberships.length > 0) {
          // Found membership - now get the neighborhood details
          const { data: neighborhood, error: neighborhoodError } = await supabase
            .from('neighborhoods')
            .select('id, name')
            .eq('id', memberships[0].neighborhood_id)
            .single();
          
          if (neighborhoodError) {
            console.warn("[useFetchNeighborhood] Error getting neighborhood details:", neighborhoodError);
          } else if (neighborhood) {
            console.log("[useFetchNeighborhood] Found neighborhood via membership:", neighborhood);
            setCurrentNeighborhood(neighborhood as Neighborhood);
            completeFetch(startTime);
            return;
          }
        }
      } catch (memErr) {
        console.warn("[useFetchNeighborhood] Exception in membership check:", memErr);
        // Continue to fallback methods
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

  return {
    currentNeighborhood,
    isCoreContributor,
    allNeighborhoods,
    setCurrentNeighborhood,
    fetchNeighborhood
  };
}
