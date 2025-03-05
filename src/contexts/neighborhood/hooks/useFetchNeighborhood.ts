
import { useCallback, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '../types';
import { 
  fetchCreatedNeighborhoods, 
  fetchAllNeighborhoods, 
  checkCoreContributorAccess,
  fetchAllNeighborhoodsForCoreContributor,
  checkNeighborhoodMembership
} from '../neighborhoodUtils';

/**
 * Hook containing the core neighborhood fetching logic
 * 
 * This hook extracts the main fetching functionality from useNeighborhoodData
 * to make it more maintainable and testable.
 * 
 * @param user The current user
 * @param currentNeighborhood The currently selected neighborhood
 * @param fetchAttempts Counter for fetch attempts
 * @returns Object containing fetch function and state setters
 */
export function useFetchNeighborhood(
  user: User | null,
  currentNeighborhood: Neighborhood | null,
  fetchAttempts: number
) {
  // State for error handling
  const [error, setError] = useState<Error | null>(null);
  
  // State to track if we have attempted a fetch
  const [hasFetchAttempted, setHasFetchAttempted] = useState(false);

  // The main fetch function that gets neighborhood data
  const fetchNeighborhood = useCallback(async (
    startFetchTimer: () => number,
    endFetchTimer: (startTime: number) => void,
    setIsLoading: (loading: boolean) => void,
    setIsCoreContributor: (isCore: boolean) => void,
    setAllNeighborhoods: (neighborhoods: Neighborhood[]) => void,
    setCurrentNeighborhood: (neighborhood: Neighborhood | null) => void
  ) => {
    // Track fetch attempts and start time
    const currentAttempt = fetchAttempts + 1;
    const startTime = startFetchTimer();
    
    console.log(`[useFetchNeighborhood] Fetch attempt ${currentAttempt} starting`);
    
    // Reset states at the start of each fetch
    setError(null);
    setIsLoading(true);
    setIsCoreContributor(false);
    setAllNeighborhoods([]);
    setHasFetchAttempted(true); // Mark that we have attempted a fetch

    // If no user is logged in, we can't fetch neighborhood data
    if (!user) {
      console.log("[useFetchNeighborhood] No user found, skipping fetch", {
        userId: null,
        fetchAttempt: currentAttempt,
        timestamp: new Date().toISOString()
      });
      setIsLoading(false);
      return;
    }

    console.log("[useFetchNeighborhood] Starting neighborhood fetch for user:", {
      userId: user.id,
      fetchAttempt: currentAttempt,
      timestamp: new Date().toISOString()
    });

    try {
      // First check if the user is a core contributor with access to all neighborhoods
      console.log(`[useFetchNeighborhood] Checking if user is core contributor (attempt ${currentAttempt})`);
      const isContributor = await checkCoreContributorAccess(user.id);
      setIsCoreContributor(isContributor);
      
      // If they are a core contributor, fetch all neighborhoods
      if (isContributor) {
        console.log("[useFetchNeighborhood] User is a core contributor with access to all neighborhoods", {
          fetchAttempt: currentAttempt
        });
        
        // Fetch all neighborhoods using the security definer function
        const neighborhoods = await fetchAllNeighborhoodsForCoreContributor(user.id);
        setAllNeighborhoods(neighborhoods);
        
        // If we have neighborhoods and no current one is set, set the first one as current
        if (neighborhoods.length > 0 && !currentNeighborhood) {
          console.log(`[useFetchNeighborhood] Setting first neighborhood for core contributor (attempt ${currentAttempt})`, {
            neighborhood: neighborhoods[0]
          });
          setCurrentNeighborhood(neighborhoods[0]);
        }
      }

      // 1. First check if the user created any neighborhoods using our utility function
      console.log(`[useFetchNeighborhood] Checking if user created neighborhoods (attempt ${currentAttempt})`);
      const { data: createdNeighborhoods, error: createdError } = await fetchCreatedNeighborhoods(user.id);
      
      if (createdError) {
        console.warn("[useFetchNeighborhood] Error checking created neighborhoods:", createdError);
      }
      
      // If user created a neighborhood, use it
      if (createdNeighborhoods && createdNeighborhoods.length > 0) {
        console.log("[useFetchNeighborhood] Found user-created neighborhood:", {
          neighborhood: createdNeighborhoods[0],
          userId: user.id,
          fetchAttempt: currentAttempt
        });
        
        setCurrentNeighborhood(createdNeighborhoods[0]);
        setIsLoading(false);
        
        // Calculate fetch duration for performance logging
        endFetchTimer(startTime);
        return;
      }
      
      // 2. Get all neighborhoods to check membership
      console.log(`[useFetchNeighborhood] Fetching all neighborhoods to check membership (attempt ${currentAttempt})`);
      const neighborhoods = await fetchAllNeighborhoods();
      
      if (!neighborhoods || neighborhoods.length === 0) {
        console.log(`[useFetchNeighborhood] No neighborhoods found (attempt ${currentAttempt})`);
        setCurrentNeighborhood(null);
        setIsLoading(false);
        
        // Calculate fetch duration for performance logging
        endFetchTimer(startTime);
        return;
      }
      
      console.log(`[useFetchNeighborhood] Found ${neighborhoods.length} neighborhoods, checking membership (attempt ${currentAttempt})`);
      
      // For each neighborhood, check if user is a member using our safe function
      for (const neighborhood of neighborhoods) {
        console.log(`[useFetchNeighborhood] Checking membership for neighborhood ${neighborhood.id} (attempt ${currentAttempt})`);
        const isMember = await checkNeighborhoodMembership(user.id, neighborhood.id);
              
        if (isMember) {
          console.log("[useFetchNeighborhood] Found user membership in neighborhood:", {
            neighborhood: neighborhood,
            userId: user.id,
            fetchAttempt: currentAttempt
          });
              
          setCurrentNeighborhood(neighborhood);
          setIsLoading(false);
          
          // Calculate fetch duration for performance logging
          endFetchTimer(startTime);
          return;
        }
      }
      
      // If we get here, user has no neighborhood (but might be a core contributor with access)
      console.log(`[useFetchNeighborhood] Completed neighborhood check (attempt ${currentAttempt}):`, {
        isCoreContributor: isContributor,
        hasNeighborhood: false
      });
      
      if (!isContributor) {
        console.log(`[useFetchNeighborhood] User has no neighborhood (attempt ${currentAttempt})`);
        setCurrentNeighborhood(null);
      }
      
      // Always ensure loading is set to false when done
      setIsLoading(false);
      
      // Calculate fetch duration for performance logging  
      endFetchTimer(startTime);
      
    } catch (err) {
      // Handle unexpected errors
      console.error("[useFetchNeighborhood] Error fetching neighborhood:", {
        error: err,
        userId: user?.id,
        fetchAttempt: currentAttempt
      });
      
      // Set error for UI to display
      setError(err instanceof Error ? err : new Error('Failed to fetch neighborhood'));
      
      // Reset current neighborhood in case of error
      setCurrentNeighborhood(null);
      
      // Always mark loading as complete
      setIsLoading(false);
      
      // Calculate fetch duration for performance logging
      endFetchTimer(startTime);
    }
  }, [currentNeighborhood, fetchAttempts, user]);

  return {
    fetchNeighborhood,
    error,
    hasFetchAttempted,
    setError
  };
}
