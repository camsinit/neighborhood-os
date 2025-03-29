
/**
 * Hook for fetching neighborhood data
 *
 * This is a simplified version with more robust error handling and
 * better resilience against RLS issues.
 */
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from './types';
import { fetchAllNeighborhoodsForCoreContributor, checkCoreContributorAccess } from './utils';
import { supabase } from '@/integrations/supabase/client';

/**
 * Simplified hook for fetching neighborhood data
 * 
 * This version has been streamlined to reduce complexity and avoid
 * recursion issues with RLS policies.
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

      // Look for neighborhoods the user created directly
      // This avoids using complex RLS policies
      try {
        const { data: neighborhoods, error } = await supabase
          .from('neighborhoods')
          .select('id, name, created_at, created_by')
          .eq('created_by', user.id)
          .limit(1);
        
        if (error) throw error;
        
        if (neighborhoods && neighborhoods.length > 0) {
          console.log("[useFetchNeighborhood] Found neighborhood created by user:", neighborhoods[0]);
          setCurrentNeighborhood(neighborhoods[0]);
          completeFetch(startTime);
          return;
        }
      } catch (err) {
        console.warn("[useFetchNeighborhood] Error checking created neighborhoods:", err);
        // Continue to the next approach
      }
      
      // SIMPLIFIED FALLBACK: Try to get memberships directly with a simpler query
      try {
        const { data: memberships, error: membershipError } = await supabase
          .rpc('get_user_neighborhoods_simple', { user_uuid: user.id });
        
        if (membershipError) {
          console.warn("[useFetchNeighborhood] Error getting memberships via RPC:", membershipError);
        } else if (memberships && memberships.length > 0) {
          console.log("[useFetchNeighborhood] Found neighborhood via membership:", memberships[0]);
          setCurrentNeighborhood(memberships[0]);
          completeFetch(startTime);
          return;
        }
      } catch (memErr) {
        console.warn("[useFetchNeighborhood] Exception in membership check:", memErr);
      }
      
      console.log("[useFetchNeighborhood] No neighborhoods found (attempt " + fetchAttempts + ")");
      setCurrentNeighborhood(null);
      
      // Complete the fetch operation
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
