
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
  
  // New state for God Mode functionality
  const [isCoreContributor, setIsCoreContributor] = useState(false);
  const [allNeighborhoods, setAllNeighborhoods] = useState<Neighborhood[]>([]);

  useEffect(() => {
    // Function to fetch the user's active neighborhood
    async function fetchNeighborhood() {
      // Reset states at the start of each fetch
      setError(null);
      setIsLoading(true);
      setIsCoreContributor(false);
      setAllNeighborhoods([]);

      // If no user is logged in, we can't fetch neighborhood data
      if (!user) {
        console.log("[useNeighborhoodData] No user found, skipping fetch", {
          userId: null,
          timestamp: new Date().toISOString()
        });
        setIsLoading(false);
        return;
      }

      console.log("[useNeighborhoodData] Starting neighborhood fetch for user:", {
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      try {
        // First check if the user is a core contributor with access to all neighborhoods
        const isContributor = await checkCoreContributorAccess(user.id);
        setIsCoreContributor(isContributor);
        
        // If they are a core contributor, fetch all neighborhoods
        if (isContributor) {
          console.log("[useNeighborhoodData] User is a core contributor with access to all neighborhoods");
          
          // Fetch all neighborhoods using the security definer function
          const neighborhoods = await fetchAllNeighborhoodsForCoreContributor(user.id);
          setAllNeighborhoods(neighborhoods);
          
          // If we have neighborhoods and no current one is set, set the first one as current
          if (neighborhoods.length > 0 && !currentNeighborhood) {
            setCurrentNeighborhood(neighborhoods[0]);
          }
          
          // Even if the user is a core contributor, we still want to proceed with the normal flow
          // to get their primary neighborhood, but we won't return early
        }

        // 1. First check if the user created any neighborhoods using our utility function
        // This avoids the RLS recursion by using a direct query pattern
        const createdNeighborhoods = await fetchCreatedNeighborhoods(user.id);
        
        // If user created a neighborhood, use it
        if (createdNeighborhoods && createdNeighborhoods.length > 0) {
          console.log("[useNeighborhoodData] Found user-created neighborhood:", {
            neighborhood: createdNeighborhoods[0],
            userId: user.id
          });
          
          setCurrentNeighborhood(createdNeighborhoods[0]);
          setIsLoading(false);
          return;
        }
        
        // 2. Get all neighborhoods to check membership
        const neighborhoods = await fetchAllNeighborhoods();
        
        if (!neighborhoods || neighborhoods.length === 0) {
          console.log("[useNeighborhoodData] No neighborhoods found");
          setCurrentNeighborhood(null);
          setIsLoading(false);
          return;
        }
        
        // For each neighborhood, check if user is a member using our safe function
        for (const neighborhood of neighborhoods) {
          // Use the security definer function to check membership
          const { data: isMember, error: membershipError } = await supabase
            .rpc('user_is_neighborhood_member', {
              user_uuid: user.id,
              neighborhood_uuid: neighborhood.id
            });
            
          if (membershipError) {
            console.error(`[useNeighborhoodData] Error checking membership for ${neighborhood.id}:`, membershipError);
            continue;
          }
            
          if (isMember) {
            console.log("[useNeighborhoodData] Found user membership in neighborhood:", {
              neighborhood: neighborhood,
              userId: user.id
            });
              
            setCurrentNeighborhood(neighborhood);
            setIsLoading(false);
            return;
          }
        }
        
        // If we get here, user has no neighborhood (but might be a core contributor with access)
        if (!isCoreContributor) {
          console.log("[useNeighborhoodData] User has no neighborhood");
          setCurrentNeighborhood(null);
        }
        
      } catch (err) {
        // Handle unexpected errors
        console.error("[useNeighborhoodData] Error fetching neighborhood:", {
          error: err,
          userId: user?.id
        });
        
        // Set error for UI to display
        setError(err instanceof Error ? err : new Error('Failed to fetch neighborhood'));
        
        // Reset current neighborhood in case of error
        setCurrentNeighborhood(null);
      } finally {
        // Always mark loading as complete
        setIsLoading(false);
      }
    }

    // Call the fetch function when the component mounts or user changes
    fetchNeighborhood();
  }, [user]);

  // Log state changes for debugging
  useEffect(() => {
    console.log("[useNeighborhoodData] State updated:", {
      currentNeighborhood,
      isLoading,
      error,
      isCoreContributor,
      neighborhoodCount: allNeighborhoods.length,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  }, [currentNeighborhood, isLoading, error, isCoreContributor, allNeighborhoods, user]);

  return { 
    currentNeighborhood, 
    isLoading, 
    error,
    isCoreContributor,
    allNeighborhoods,
    setCurrentNeighborhood
  };
}
