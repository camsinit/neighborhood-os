
import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from './types';
import { 
  fetchCreatedNeighborhoods, 
  fetchAllNeighborhoods, 
  checkCoreContributorAccess,
  fetchAllNeighborhoodsForCoreContributor,
  checkNeighborhoodMembership
} from './neighborhoodUtils';

/**
 * Custom hook that handles fetching and managing neighborhood data
 * 
 * This improved version avoids RLS recursion issues by using safer query patterns
 * 
 * @param user - The current authenticated user
 * @returns Object containing neighborhood data and loading state
 */
export function useNeighborhoodData(user: User | null) {
  // State variables to track the neighborhood data and loading status
  const [currentNeighborhood, setCurrentNeighborhood] = useState<Neighborhood | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // State for God Mode functionality
  const [isCoreContributor, setIsCoreContributor] = useState(false);
  const [allNeighborhoods, setAllNeighborhoods] = useState<Neighborhood[]>([]);

  // Add a manual refresh function
  const refreshNeighborhoodData = useCallback(() => {
    console.log("[useNeighborhoodData] Manual refresh triggered");
    setIsLoading(true);
    setError(null);
  }, []);

  // Function to fetch the user's active neighborhood
  useEffect(() => {
    async function fetchNeighborhood() {
      // Skip fetching if no user is logged in
      if (!user) {
        console.log("[useNeighborhoodData] No user found, skipping fetch");
        setIsLoading(false);
        return;
      }

      console.log("[useNeighborhoodData] Starting neighborhood fetch for user:", user.id);
      setError(null);
      setIsLoading(true);

      try {
        // 1. First check if the user is a core contributor with God Mode access
        const isContributor = await checkCoreContributorAccess(user.id);
        setIsCoreContributor(isContributor);
        
        if (isContributor) {
          console.log("[useNeighborhoodData] User is a core contributor with access to all neighborhoods");
          
          // Fetch all neighborhoods for the core contributor
          const neighborhoods = await fetchAllNeighborhoodsForCoreContributor(user.id);
          setAllNeighborhoods(neighborhoods);
          
          // If we have neighborhoods and no current one is set, set the first one as current
          if (neighborhoods.length > 0 && !currentNeighborhood) {
            console.log("[useNeighborhoodData] Setting first neighborhood for core contributor");
            setCurrentNeighborhood(neighborhoods[0]);
          }
        }

        // 2. Check if the user created any neighborhoods
        console.log("[useNeighborhoodData] Checking if user created neighborhoods");
        const { data: createdNeighborhoods, error: createdError } = await fetchCreatedNeighborhoods(user.id);
        
        if (createdError) {
          console.warn("[useNeighborhoodData] Error checking created neighborhoods:", createdError);
        }
        
        // If user created a neighborhood, use it
        if (createdNeighborhoods && createdNeighborhoods.length > 0) {
          console.log("[useNeighborhoodData] Found user-created neighborhood:", createdNeighborhoods[0]);
          setCurrentNeighborhood(createdNeighborhoods[0]);
          setIsLoading(false);
          return;
        }
        
        // 3. Otherwise, iterate through all neighborhoods to check membership
        console.log("[useNeighborhoodData] Checking neighborhood membership");
        const neighborhoods = await fetchAllNeighborhoods();
        
        if (!neighborhoods || neighborhoods.length === 0) {
          console.log("[useNeighborhoodData] No neighborhoods found");
          setCurrentNeighborhood(null);
          setIsLoading(false);
          return;
        }
        
        // For each neighborhood, check if user is a member
        for (const neighborhood of neighborhoods) {
          const isMember = await checkNeighborhoodMembership(user.id, neighborhood.id);
                
          if (isMember) {
            console.log("[useNeighborhoodData] Found user membership in neighborhood:", neighborhood);
            setCurrentNeighborhood(neighborhood);
            setIsLoading(false);
            return;
          }
        }
        
        // If no neighborhood found, set to null
        console.log("[useNeighborhoodData] No membership found for user");
        setCurrentNeighborhood(null);
        setIsLoading(false);
      } catch (err) {
        // Handle unexpected errors
        console.error("[useNeighborhoodData] Error fetching neighborhood:", err);
        setError(err instanceof Error ? err : new Error('Failed to fetch neighborhood'));
        setCurrentNeighborhood(null);
        setIsLoading(false);
      }
    }

    fetchNeighborhood();
  }, [user, currentNeighborhood, refreshNeighborhoodData]);

  return { 
    currentNeighborhood, 
    isLoading, 
    error,
    isCoreContributor,
    allNeighborhoods,
    setCurrentNeighborhood,
    refreshNeighborhoodData
  };
}
