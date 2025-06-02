
/**
 * Simplified neighborhood fetching hook
 * 
 * UPDATED: Now uses the new simplified RLS policies and helper function
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
 * UPDATED: Now uses the new simplified helper function
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
   * Uses the new simplified helper function to avoid RLS recursion
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

      // Use the new simplified helper function
      const { data: neighborhoodIds, error: idsError } = await supabase
        .rpc('get_user_neighborhood_ids', { user_uuid: user.id });

      if (idsError) {
        throw new Error(`Failed to fetch neighborhood IDs: ${idsError.message}`);
      }

      logger.debug('Found neighborhood IDs:', neighborhoodIds);

      // If we have neighborhoods, get the first one as current
      if (neighborhoodIds && neighborhoodIds.length > 0) {
        // Get full neighborhood details for the first neighborhood
        const { data: neighborhoodDetails, error: detailsError } = await supabase
          .from('neighborhoods')
          .select('id, name, created_by')
          .eq('id', neighborhoodIds[0])
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
