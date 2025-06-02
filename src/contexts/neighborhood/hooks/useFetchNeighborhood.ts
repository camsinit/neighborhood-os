
/**
 * Simplified neighborhood fetching hook
 * 
 * This version uses simple, direct queries to avoid RLS recursion issues
 * Works with the new simplified RLS policies
 */
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Neighborhood } from '../types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useFetchNeighborhood');

interface FetchNeighborhoodOptions {
  startFetch: () => void;
  completeFetch: (neighborhood: Neighborhood | null) => void;
  handleFetchError: (error: Error) => void;
  setIsLoading: (loading: boolean) => void;
}

/**
 * Custom hook for fetching neighborhood data
 * UPDATED: Uses simplified queries to avoid RLS recursion
 */
export function useFetchNeighborhood(
  user: User | null,
  fetchAttempts: number,
  options: FetchNeighborhoodOptions
) {
  const { startFetch, completeFetch, handleFetchError, setIsLoading } = options;
  
  // State for the current neighborhood
  const [currentNeighborhood, setCurrentNeighborhood] = useState<Neighborhood | null>(null);

  /**
   * Main function to fetch neighborhood data
   * Uses simple queries that work with our new RLS policies
   */
  const fetchNeighborhood = useCallback(async () => {
    if (!user?.id) {
      logger.debug('No user found, skipping neighborhood fetch');
      setCurrentNeighborhood(null);
      return;
    }

    try {
      startFetch();
      setIsLoading(true);
      
      logger.debug('Fetching neighborhoods for user:', user.id);

      // Step 1: Get user's memberships - this query is simple and won't cause recursion
      const { data: memberships, error: membershipError } = await supabase
        .from('neighborhood_members')
        .select('neighborhood_id')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (membershipError) {
        throw new Error(`Failed to fetch memberships: ${membershipError.message}`);
      }

      // Step 2: Get neighborhoods created by the user - also simple query
      const { data: createdNeighborhoods, error: createdError } = await supabase
        .from('neighborhoods')
        .select('id, name, created_by')
        .eq('created_by', user.id);

      if (createdError) {
        throw new Error(`Failed to fetch created neighborhoods: ${createdError.message}`);
      }

      // Step 3: Combine membership and created neighborhood IDs
      const membershipIds = memberships?.map(m => m.neighborhood_id) || [];
      const createdIds = createdNeighborhoods?.map(n => n.id) || [];
      const allNeighborhoodIds = [...new Set([...membershipIds, ...createdIds])];

      logger.debug('Found neighborhood IDs:', allNeighborhoodIds);

      // Step 4: If we have neighborhoods, get the first one as current
      if (allNeighborhoodIds.length > 0) {
        // Get full neighborhood details for the first neighborhood
        const { data: neighborhoodDetails, error: detailsError } = await supabase
          .from('neighborhoods')
          .select('id, name, created_by')
          .eq('id', allNeighborhoodIds[0])
          .single();

        if (detailsError) {
          throw new Error(`Failed to fetch neighborhood details: ${detailsError.message}`);
        }

        const neighborhood: Neighborhood = {
          id: neighborhoodDetails.id,
          name: neighborhoodDetails.name,
          created_by: neighborhoodDetails.created_by
        };

        logger.debug('Successfully fetched neighborhood:', neighborhood);
        setCurrentNeighborhood(neighborhood);
        completeFetch(neighborhood);
      } else {
        logger.debug('No neighborhoods found for user');
        setCurrentNeighborhood(null);
        completeFetch(null);
      }

    } catch (error) {
      logger.error('Error fetching neighborhood:', error);
      handleFetchError(error instanceof Error ? error : new Error('Unknown error'));
      setCurrentNeighborhood(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, startFetch, completeFetch, handleFetchError, setIsLoading]);

  return {
    currentNeighborhood,
    setCurrentNeighborhood,
    fetchNeighborhood
  };
}
