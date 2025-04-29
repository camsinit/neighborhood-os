
/**
 * Hook for fetching neighborhood data
 *
 * This version uses our new security definer functions to avoid recursion.
 */
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '../types';
import { 
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

      // First try RPC function that uses security definer permissions
      try {
        // Try calling our safe RPC function
        const { data, error } = await supabase
          .rpc('get_user_neighborhoods_simple', {
            user_uuid: user.id
          });
        
        if (error) {
          console.warn("[useFetchNeighborhood] RPC error:", error);
        } else if (data && data.length > 0) {
          console.log("[useFetchNeighborhood] Found neighborhoods via RPC:", data);
          setCurrentNeighborhood(data[0] as Neighborhood);
          completeFetch(startTime);
          return;
        }
      } catch (rpcErr) {
        console.warn("[useFetchNeighborhood] RPC exception:", rpcErr);
      }

      // Try direct query for neighborhoods the user created
      try {
        const { data: createdNeighborhoods, error: createdError } = 
          await fetchCreatedNeighborhoods(user.id);
        
        if (createdError) {
          console.warn("[useFetchNeighborhood] Error checking created neighborhoods:", createdError);
        } else if (createdNeighborhoods && createdNeighborhoods.length > 0) {
          console.log("[useFetchNeighborhood] Found created neighborhoods:", createdNeighborhoods);
          setCurrentNeighborhood(createdNeighborhoods[0]);
          completeFetch(startTime);
          return;
        }
      } catch (err) {
        console.warn("[useFetchNeighborhood] Error in created neighborhoods check:", err);
      }
      
      // Fall back to direct neighborhood membership query
      try {
        // Get membership data
        const { data: memberships, error: membershipError } = 
          await fetchUserMemberships(user.id);
        
        if (membershipError) {
          console.warn("[useFetchNeighborhood] Error checking memberships:", membershipError);
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
