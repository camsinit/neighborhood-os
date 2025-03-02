import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from './types';
import { 
  fetchCreatedNeighborhoods, 
  checkNeighborhoodMembership, 
  fetchAllNeighborhoods 
} from './neighborhoodUtils';

/**
 * Custom hook that handles fetching and managing neighborhood data
 * 
 * @param user - The current authenticated user
 * @returns Object containing neighborhood data and loading state
 */
export function useNeighborhoodData(user: User | null) {
  // State variables to track the neighborhood data and loading status
  const [currentNeighborhood, setCurrentNeighborhood] = useState<Neighborhood | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Function to fetch the user's active neighborhood
    async function fetchNeighborhood() {
      // Reset states at the start of each fetch
      setError(null);
      setIsLoading(true);

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
        // First, check if user created any neighborhoods
        const createdNeighborhoods = await fetchCreatedNeighborhoods(user.id);
        
        // If user created neighborhoods, use the first one
        if (createdNeighborhoods.length > 0) {
          console.log("[useNeighborhoodData] Found user-created neighborhood:", {
            neighborhood: createdNeighborhoods[0],
            userId: user.id
          });
          
          setCurrentNeighborhood(createdNeighborhoods[0]);
          setIsLoading(false);
          return;
        }
        
        // If user didn't create a neighborhood, check membership in existing neighborhoods
        console.log("[useNeighborhoodData] Checking user membership in neighborhoods");
        
        // First, get all neighborhoods
        const allNeighborhoods = await fetchAllNeighborhoods();
        
        // No neighborhoods found
        if (allNeighborhoods.length === 0) {
          console.log("[useNeighborhoodData] No neighborhoods found in the system");
          setCurrentNeighborhood(null);
          setIsLoading(false);
          return;
        }
        
        console.log("[useNeighborhoodData] Found neighborhoods to check membership for:", {
          count: allNeighborhoods.length 
        });
        
        // For each neighborhood, see if the user is a member
        // Only check a few to keep the queries manageable
        const neighborhoodsToCheck = allNeighborhoods.slice(0, 5);
        
        for (const neighborhood of neighborhoodsToCheck) {
          // Check if user is a member of this neighborhood
          const isMember = await checkNeighborhoodMembership(user.id, neighborhood.id);
          
          // If user is a member of this neighborhood, use it
          if (isMember) {
            console.log("[useNeighborhoodData] Found membership in neighborhood:", {
              neighborhood: neighborhood,
              userId: user.id
            });
            
            setCurrentNeighborhood(neighborhood);
            setIsLoading(false);
            return;
          }
        }
            
        // User has no neighborhood
        console.log("[useNeighborhoodData] User has no neighborhood");
        setCurrentNeighborhood(null);
        setIsLoading(false);
        
      } catch (err) {
        // Handle unexpected errors
        console.error("[useNeighborhoodData] Critical error:", {
          error: err,
          userId: user?.id,
          timestamp: new Date().toISOString()
        });
        setError(err instanceof Error ? err : new Error('Failed to fetch neighborhood'));
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
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  }, [currentNeighborhood, isLoading, error, user]);

  return { currentNeighborhood, isLoading, error };
}
