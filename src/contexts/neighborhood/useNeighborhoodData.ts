
/**
 * Main neighborhood data hook
 * 
 * UPDATED: Now uses the new simplified helper function
 */
import { User } from '@supabase/supabase-js';
import { useNeighborhoodStatus } from './hooks/useNeighborhoodStatus';
import { useFetchNeighborhood } from './hooks/useFetchNeighborhood';
import { useAuthStabilizer } from './hooks/useAuthStabilizer';
import { useNeighborhoodMonitor } from './hooks/useNeighborhoodMonitor';
import { useEffect, useState, useCallback } from 'react';
import { Neighborhood } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useNeighborhoodData');

/**
 * Custom hook that handles fetching and managing neighborhood data
 * UPDATED: Now uses the new simplified helper function
 * 
 * @param user - The current authenticated user
 * @returns Object containing neighborhood data and loading state
 */
export function useNeighborhoodData(user: User | null) {
  // Initialize status tracking
  const statusHook = useNeighborhoodStatus();
  const {
    isLoading, setIsLoading,
    error, setError,
    fetchAttempts,
    refreshNeighborhoodData,
    startFetch,
    completeFetch,
    handleFetchError
  } = statusHook;
  
  // State for user neighborhoods
  const [userNeighborhoods, setUserNeighborhoods] = useState<Neighborhood[]>([]);
  
  // Wait for auth to stabilize
  const isAuthStable = useAuthStabilizer(user);
  
  // Initialize neighborhood data fetching
  const neighborhoodHook = useFetchNeighborhood(
    isAuthStable ? user : null,
    fetchAttempts,
    { startFetch, completeFetch, handleFetchError, setIsLoading }
  );
  const {
    currentNeighborhood,
    setCurrentNeighborhood,
    fetchNeighborhood
  } = neighborhoodHook;

  /**
   * Function to fetch user's neighborhoods using the new helper function
   */
  const fetchUserNeighborhoods = useCallback(async () => {
    if (!user?.id) {
      setUserNeighborhoods([]);
      return;
    }

    try {
      logger.debug('Fetching user neighborhoods for:', user.id);

      // Use the new simplified helper function
      const { data: neighborhoodIds, error: idsError } = await supabase
        .rpc('get_user_neighborhood_ids', { user_uuid: user.id });

      if (idsError) {
        logger.error('Error fetching neighborhood IDs:', idsError);
        return;
      }

      if (neighborhoodIds && neighborhoodIds.length > 0) {
        // Get details for all neighborhoods
        const { data: neighborhoodDetails, error: detailsError } = await supabase
          .from('neighborhoods')
          .select('id, name, created_by')
          .in('id', neighborhoodIds);

        if (detailsError) {
          logger.error('Error fetching neighborhood details:', detailsError);
          return;
        }

        const neighborhoods: Neighborhood[] = neighborhoodDetails?.map(n => ({
          id: n.id,
          name: n.name,
          created_by: n.created_by
        })) || [];

        logger.debug('Successfully fetched user neighborhoods:', neighborhoods);
        setUserNeighborhoods(neighborhoods);
      } else {
        logger.debug('No neighborhoods found for user');
        setUserNeighborhoods([]);
      }
    } catch (error) {
      logger.error('Error in fetchUserNeighborhoods:', error);
    }
  }, [user?.id]);

  // Function to switch to a different neighborhood
  const switchNeighborhood = useCallback(async (neighborhoodId: string) => {
    const targetNeighborhood = userNeighborhoods.find(n => n.id === neighborhoodId);
    if (targetNeighborhood) {
      setCurrentNeighborhood(targetNeighborhood);
      toast.success(`Switched to ${targetNeighborhood.name}`);
    }
  }, [userNeighborhoods, setCurrentNeighborhood]);
  
  // Set up monitoring and safety timeouts
  useNeighborhoodMonitor({
    currentNeighborhood,
    isLoading,
    error,
    user,
    fetchAttempts,
    setIsLoading,
    setError
  });

  // Main effect to fetch neighborhood data
  useEffect(() => {
    // Call the fetch functions when the user/fetchAttempts changes
    // and auth state is stable
    if (isAuthStable) {
      fetchNeighborhood();
      fetchUserNeighborhoods();
    }
  }, [isAuthStable, user, fetchAttempts, fetchNeighborhood, fetchUserNeighborhoods]);

  // Return updated state and functions
  return { 
    currentNeighborhood,
    userNeighborhoods,
    isLoading, 
    error,
    setCurrentNeighborhood,
    switchNeighborhood,
    refreshNeighborhoodData
  };
}
