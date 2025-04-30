
/**
 * Hook for fetching neighborhood data
 *
 * This simplified version has removed core contributor functionality.
 */
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '../types';
import { 
  fetchCreatedNeighborhoods,
  checkCoreContributorAccess,
  fetchAllNeighborhoodsForCoreContributor
} from '../utils/neighborhoodFetchUtils';
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
  // State variables for neighborhood data - removed core contributor related state
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

      // Check if the user has created any neighborhoods
      const { data: createdNeighborhoods, error: createdError } = await fetchCreatedNeighborhoods(user.id);
      
      if (createdError) {
        logger.warn("Error getting created neighborhoods:", createdError);
      } else if (createdNeighborhoods && createdNeighborhoods.length > 0) {
        // Found created neighborhoods
        logger.debug("Found created neighborhoods:", createdNeighborhoods.length);
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
          logger.warn("Error getting neighborhood memberships:", membershipError);
        } else if (memberships && memberships.length > 0) {
          // Found membership - now get the neighborhood details
          const { data: neighborhood, error: neighborhoodError } = await supabase
            .from('neighborhoods')
            .select('id, name')
            .eq('id', memberships[0].neighborhood_id)
            .single();
          
          if (neighborhoodError) {
            logger.warn("Error getting neighborhood details:", neighborhoodError);
          } else if (neighborhood) {
            logger.debug("Found neighborhood via membership:", neighborhood.name);
            setCurrentNeighborhood(neighborhood as Neighborhood);
            completeFetch(startTime);
            return;
          }
        }
      } catch (memErr) {
        logger.warn("Exception in membership check:", memErr);
      }
      
      logger.debug("No neighborhoods found (attempt " + fetchAttempts + ")");
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

  // Return simplified data and functions (removed core contributor related data)
  return {
    currentNeighborhood,
    setCurrentNeighborhood,
    fetchNeighborhood
  };
}
