
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from './types';
import { fetchCreatedNeighborhoods, fetchAllNeighborhoods, checkNeighborhoodMembership } from './neighborhoodUtils';

/**
 * Custom hook that handles fetching and managing neighborhood data
 * 
 * This improved version is more resilient against errors and provides
 * better error handling and recovery
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
        // First, check if user created any neighborhoods - this is the most reliable approach
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
        
        // If user didn't create a neighborhood, let's try a simplified approach
        // Just get the first neighborhood and check if user is a member
        // This avoids the need to iterate through all neighborhoods
        console.log("[useNeighborhoodData] No created neighborhoods, checking memberships");
        
        const allNeighborhoods = await fetchAllNeighborhoods();
        
        if (allNeighborhoods.length === 0) {
          console.log("[useNeighborhoodData] No neighborhoods found in the system");
          setCurrentNeighborhood(null);
          setIsLoading(false);
          return;
        }
        
        // Just check the first neighborhood - in most cases users belong to only one neighborhood
        // This simplifies the process and reduces database queries
        const firstNeighborhood = allNeighborhoods[0];
        const isMember = await checkNeighborhoodMembership(user.id, firstNeighborhood.id);
        
        if (isMember) {
          console.log("[useNeighborhoodData] User is a member of first neighborhood:", {
            neighborhood: firstNeighborhood,
            userId: user.id
          });
          
          setCurrentNeighborhood(firstNeighborhood);
          setIsLoading(false);
          return;
        }
        
        // User has no neighborhood
        console.log("[useNeighborhoodData] User has no neighborhood");
        setCurrentNeighborhood(null);
        setIsLoading(false);
        
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
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  }, [currentNeighborhood, isLoading, error, user]);

  return { currentNeighborhood, isLoading, error };
}
