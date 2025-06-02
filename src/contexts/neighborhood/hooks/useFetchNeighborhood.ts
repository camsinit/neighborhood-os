
/**
 * Hook for fetching neighborhood data
 *
 * UPDATED: Now works with the new security definer functions and fixed RLS policies
 */
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('FetchNeighborhood');

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
  const [currentNeighborhood, setCurrentNeighborhood] = useState<Neighborhood | null>(null);

  // The main fetch function that retrieves neighborhood data using new security definer functions
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

      logger.debug("Fetching neighborhoods for user:", user.id);

      // Use the updated security definer function
      const { data: accessibleNeighborhoods, error: accessError } = await supabase
        .rpc('get_user_accessible_neighborhoods', { user_uuid: user.id });

      if (accessError) {
        logger.warn("Error getting accessible neighborhoods:", accessError);
        handleFetchError(accessError, startTime);
        return;
      }

      if (accessibleNeighborhoods && accessibleNeighborhoods.length > 0) {
        // Extract the neighborhood_id from the first result
        const firstNeighborhoodId = accessibleNeighborhoods[0].neighborhood_id;
        
        // Get the neighborhood details using the new RLS policy
        const { data: neighborhood, error: neighborhoodError } = await supabase
          .from('neighborhoods')
          .select('id, name')
          .eq('id', firstNeighborhoodId)
          .single();

        if (neighborhoodError) {
          logger.warn("Error getting neighborhood details:", neighborhoodError);
          handleFetchError(neighborhoodError, startTime);
          return;
        }

        if (neighborhood) {
          logger.debug("Found neighborhood:", neighborhood.name);
          setCurrentNeighborhood(neighborhood as Neighborhood);
          completeFetch(startTime);
          return;
        }
      }
      
      logger.debug("No neighborhoods found (attempt " + fetchAttempts + ")");
      setCurrentNeighborhood(null);
      completeFetch(startTime);
      
    } catch (err) {
      // Handle unexpected errors
      handleFetchError(err, startTime);
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
    setCurrentNeighborhood,
    fetchNeighborhood
  };
}
