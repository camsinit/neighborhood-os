
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from './types';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchCreatedNeighborhoods, 
  fetchAllNeighborhoods, 
  checkCoreContributorAccess,
  fetchAllNeighborhoodsForCoreContributor 
} from './neighborhoodUtils';

/**
 * Custom hook that handles fetching and managing neighborhood data
 * 
 * This improved version completely avoids the RLS recursion issue by using 
 * security definer functions to safely fetch neighborhood information
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

  // Add a state to track fetch attempts for debugging
  const [fetchAttempts, setFetchAttempts] = useState(0);

  useEffect(() => {
    // Function to fetch the user's active neighborhood
    async function fetchNeighborhood() {
      // Track fetch attempts
      const currentAttempt = fetchAttempts + 1;
      setFetchAttempts(currentAttempt);
      
      console.log(`[useNeighborhoodData] Fetch attempt ${currentAttempt} starting`);
      
      // Reset states at the start of each fetch
      setError(null);
      setIsLoading(true);
      setIsCoreContributor(false);
      setAllNeighborhoods([]);

      // If no user is logged in, we can't fetch neighborhood data
      if (!user) {
        console.log("[useNeighborhoodData] No user found, skipping fetch", {
          userId: null,
          fetchAttempt: currentAttempt,
          timestamp: new Date().toISOString()
        });
        setIsLoading(false);
        return;
      }

      console.log("[useNeighborhoodData] Starting neighborhood fetch for user:", {
        userId: user.id,
        fetchAttempt: currentAttempt,
        timestamp: new Date().toISOString()
      });

      try {
        // Add additional logging for supabase client check
        if (!supabase || !supabase.rpc) {
          console.error("[useNeighborhoodData] Supabase client is invalid:", { 
            supabaseExists: !!supabase,
            rpcExists: !!(supabase && supabase.rpc),
            fetchAttempt: currentAttempt
          });
          throw new Error("Supabase client is not properly initialized");
        }

        // First check if the user is a core contributor with access to all neighborhoods
        console.log(`[useNeighborhoodData] Checking if user is core contributor (attempt ${currentAttempt})`);
        const isContributor = await checkCoreContributorAccess(user.id);
        setIsCoreContributor(isContributor);
        
        // If they are a core contributor, fetch all neighborhoods
        if (isContributor) {
          console.log("[useNeighborhoodData] User is a core contributor with access to all neighborhoods", {
            fetchAttempt: currentAttempt
          });
          
          // Fetch all neighborhoods using the security definer function
          const neighborhoods = await fetchAllNeighborhoodsForCoreContributor(user.id);
          setAllNeighborhoods(neighborhoods);
          
          // If we have neighborhoods and no current one is set, set the first one as current
          if (neighborhoods.length > 0 && !currentNeighborhood) {
            console.log(`[useNeighborhoodData] Setting first neighborhood for core contributor (attempt ${currentAttempt})`, {
              neighborhood: neighborhoods[0]
            });
            setCurrentNeighborhood(neighborhoods[0]);
          }
          
          // Even if the user is a core contributor, we still want to proceed with the normal flow
          // to get their primary neighborhood, but we won't return early
        }

        // 1. First check if the user created any neighborhoods using our utility function
        console.log(`[useNeighborhoodData] Checking if user created neighborhoods (attempt ${currentAttempt})`);
        const createdNeighborhoods = await fetchCreatedNeighborhoods(user.id);
        
        // If user created a neighborhood, use it
        if (createdNeighborhoods && createdNeighborhoods.length > 0) {
          console.log("[useNeighborhoodData] Found user-created neighborhood:", {
            neighborhood: createdNeighborhoods[0],
            userId: user.id,
            fetchAttempt: currentAttempt
          });
          
          setCurrentNeighborhood(createdNeighborhoods[0]);
          setIsLoading(false);
          return;
        }
        
        // 2. Get all neighborhoods to check membership
        console.log(`[useNeighborhoodData] Fetching all neighborhoods to check membership (attempt ${currentAttempt})`);
        const neighborhoods = await fetchAllNeighborhoods();
        
        if (!neighborhoods || neighborhoods.length === 0) {
          console.log(`[useNeighborhoodData] No neighborhoods found (attempt ${currentAttempt})`);
          setCurrentNeighborhood(null);
          setIsLoading(false);
          return;
        }
        
        console.log(`[useNeighborhoodData] Found ${neighborhoods.length} neighborhoods, checking membership (attempt ${currentAttempt})`);
        
        // For each neighborhood, check if user is a member using our safe function
        for (const neighborhood of neighborhoods) {
          console.log(`[useNeighborhoodData] Checking membership for neighborhood ${neighborhood.id} (attempt ${currentAttempt})`);
          try {
            // Use the security definer function to check membership
            const { data: isMember, error: membershipError } = await supabase
              .rpc('user_is_neighborhood_member', {
                user_uuid: user.id,
                neighborhood_uuid: neighborhood.id
              });
              
            if (membershipError) {
              console.error(`[useNeighborhoodData] Error checking membership for ${neighborhood.id}:`, {
                error: membershipError,
                fetchAttempt: currentAttempt
              });
              continue;
            }
              
            if (isMember) {
              console.log("[useNeighborhoodData] Found user membership in neighborhood:", {
                neighborhood: neighborhood,
                userId: user.id,
                fetchAttempt: currentAttempt
              });
                
              setCurrentNeighborhood(neighborhood);
              setIsLoading(false);
              return;
            }
          } catch (memberError) {
            console.error(`[useNeighborhoodData] Exception checking membership for ${neighborhood.id}:`, {
              error: memberError,
              fetchAttempt: currentAttempt
            });
            continue;
          }
        }
        
        // If we get here, user has no neighborhood (but might be a core contributor with access)
        console.log(`[useNeighborhoodData] Completed neighborhood check (attempt ${currentAttempt}):`, {
          isCoreContributor: isContributor,
          hasNeighborhood: false
        });
        
        if (!isContributor) {
          console.log(`[useNeighborhoodData] User has no neighborhood (attempt ${currentAttempt})`);
          setCurrentNeighborhood(null);
        }
        
        // Always ensure loading is set to false when done
        setIsLoading(false);
        
      } catch (err) {
        // Handle unexpected errors
        console.error("[useNeighborhoodData] Error fetching neighborhood:", {
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
      }
    }

    // Call the fetch function when the component mounts or user changes
    fetchNeighborhood();
    
    // Add a safety timeout to ensure loading state is eventually cleared
    // even if the fetch operation gets stuck
    const safetyTimer = setTimeout(() => {
      if (isLoading) {
        console.warn("[useNeighborhoodData] Safety timeout triggered - fetch operation took too long");
        setIsLoading(false);
        setError(new Error("Neighborhood data fetch timed out"));
      }
    }, 10000); // 10 second timeout
    
    return () => {
      clearTimeout(safetyTimer);
    };
    
  }, [user, fetchAttempts]); // Add fetchAttempts to make it easy to force a refresh

  // Log state changes for debugging
  useEffect(() => {
    console.log("[useNeighborhoodData] State updated:", {
      currentNeighborhood,
      isLoading,
      error: error?.message || null,
      isCoreContributor,
      neighborhoodCount: allNeighborhoods.length,
      userId: user?.id,
      fetchAttempts,
      timestamp: new Date().toISOString()
    });
  }, [currentNeighborhood, isLoading, error, isCoreContributor, allNeighborhoods, user, fetchAttempts]);

  // Add a manual refresh function
  const refreshNeighborhoodData = () => {
    console.log("[useNeighborhoodData] Manual refresh triggered");
    setFetchAttempts(prev => prev + 1);
  };

  return { 
    currentNeighborhood, 
    isLoading, 
    error,
    isCoreContributor,
    allNeighborhoods,
    setCurrentNeighborhood,
    refreshNeighborhoodData  // New function to force refresh
  };
}
