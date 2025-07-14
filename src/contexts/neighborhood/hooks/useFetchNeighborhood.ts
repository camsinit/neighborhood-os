
/**
 * Hook for fetching neighborhood data
 *
 * UPDATED: Now uses direct queries instead of removed security definer functions
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

  // The main fetch function that retrieves neighborhood data using direct queries
  const fetchNeighborhood = useCallback(async () => {
    // Skip if no user is logged in
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Start timing and tracking the fetch operation
    const startTime = startFetch();
    
    try {
      // Always fetch fresh neighborhood data to ensure dashboard pages load properly

      logger.debug("Fetching neighborhoods for user:", user.id);

      // First, check if user created any neighborhoods
      const { data: createdNeighborhoods, error: createdError } = await supabase
        .from('neighborhoods')
        .select('id, name, created_by')
        .eq('created_by', user.id)
        .limit(1);

      if (createdError) {
        logger.warn("Error getting created neighborhoods:", createdError);
        handleFetchError(createdError, startTime);
        return;
      }

      // If user created a neighborhood, use that
      if (createdNeighborhoods && createdNeighborhoods.length > 0) {
        const neighborhood = createdNeighborhoods[0] as Neighborhood;
        logger.debug("Found created neighborhood:", neighborhood.name);
        setCurrentNeighborhood(neighborhood);
        completeFetch(startTime);
        return;
      }

      // If no created neighborhoods, check membership
      const { data: membershipData, error: membershipError } = await supabase
        .from('neighborhood_members')
        .select(`
          neighborhood_id,
          neighborhoods:neighborhood_id (
            id,
            name,
            created_by
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);

      if (membershipError) {
        logger.warn("Error getting neighborhood memberships:", membershipError);
        handleFetchError(membershipError, startTime);
        return;
      }

      // If user is a member of a neighborhood, use that
      if (membershipData && membershipData.length > 0 && membershipData[0].neighborhoods) {
        const neighborhood = membershipData[0].neighborhoods as Neighborhood;
        logger.debug("Found membership neighborhood:", neighborhood.name);
        setCurrentNeighborhood(neighborhood);
        completeFetch(startTime);
        return;
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
