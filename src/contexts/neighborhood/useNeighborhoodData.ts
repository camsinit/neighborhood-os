import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from './types';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchCreatedNeighborhoods, 
  checkCoreContributorAccess,
  fetchAllNeighborhoods,
  fetchAllNeighborhoodsForCoreContributor
} from './utils';
import { toast } from 'sonner';

/**
 * Custom hook that handles fetching and managing neighborhood data
 * 
 * This improved version handles the RLS recursion issue by using 
 * security definer functions and adds fallback mechanisms
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

  // Add a state to track fetch attempts and implement exponential backoff
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  
  // Add a state to track fetch duration for performance monitoring
  const [fetchStartTime, setFetchStartTime] = useState<number | null>(null);

  // Create a memoized refresh function that can be called from outside components
  const refreshNeighborhoodData = useCallback(() => {
    console.log("[useNeighborhoodData] Manual refresh triggered");
    // Reset retry count on manual refresh
    setRetryCount(0);
    setFetchAttempts(prev => prev + 1);
  }, []);

  // Function to fetch the user's active neighborhood
  const fetchNeighborhood = useCallback(async () => {
    // Skip if no user is logged in
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Track fetch attempts and start time
    const startTime = Date.now();
    setFetchStartTime(startTime);
    
    console.log(`[useNeighborhoodData] Fetch attempt ${fetchAttempts} starting`);
    
    // Reset states at the start of each fetch
    setError(null);
    setIsLoading(true);

    try {
      // First check if the user is a core contributor with access to all neighborhoods
      console.log(`[useNeighborhoodData] Checking if user is core contributor (attempt ${fetchAttempts})`);
      const isContributor = await checkCoreContributorAccess(user.id);
      setIsCoreContributor(isContributor);
      
      // If they are a core contributor, fetch all neighborhoods
      if (isContributor) {
        console.log("[useNeighborhoodData] User is a core contributor with access to all neighborhoods", {
          fetchAttempt: fetchAttempts
        });
        
        // Fetch all neighborhoods
        const neighborhoods = await fetchAllNeighborhoodsForCoreContributor(user.id);
        setAllNeighborhoods(neighborhoods);
        
        // If we have neighborhoods and no current one is set, set the first one as current
        if (neighborhoods.length > 0 && !currentNeighborhood) {
          console.log(`[useNeighborhoodData] Setting first neighborhood for core contributor (attempt ${fetchAttempts})`, {
            neighborhood: neighborhoods[0]
          });
          setCurrentNeighborhood(neighborhoods[0]);
          setIsLoading(false);
          return;
        }
      }

      // If we already have a current neighborhood, we're done
      if (currentNeighborhood) {
        setIsLoading(false);
        return;
      }

      // Check if the user has created any neighborhoods
      const { data: createdNeighborhoods, error: createdError } = await fetchCreatedNeighborhoods(user.id);
      
      if (createdError) {
        console.warn("[useNeighborhoodData] Error getting created neighborhoods:", createdError);
      } else if (createdNeighborhoods && createdNeighborhoods.length > 0) {
        // Found created neighborhoods
        console.log("[useNeighborhoodData] Found created neighborhoods:", createdNeighborhoods);
        setCurrentNeighborhood(createdNeighborhoods[0]);
        setIsLoading(false);
        return;
      }
      
      // SAFE FALLBACK: Try direct membership
      try {
        // Get direct membership
        const { data: memberships, error: membershipError } = await supabase
          .from('neighborhood_members')
          .select('neighborhood_id')
          .eq('user_id', user.id)
          .eq('status', 'active');
        
        if (membershipError) {
          console.warn("[useNeighborhoodData] Error getting neighborhood memberships:", membershipError);
        } else if (memberships && memberships.length > 0) {
          // Found membership - now get the neighborhood details
          const { data: neighborhood, error: neighborhoodError } = await supabase
            .from('neighborhoods')
            .select('id, name')
            .eq('id', memberships[0].neighborhood_id)
            .single();
          
          if (neighborhoodError) {
            console.warn("[useNeighborhoodData] Error getting neighborhood details:", neighborhoodError);
          } else if (neighborhood) {
            console.log("[useNeighborhoodData] Found neighborhood via membership:", neighborhood);
            setCurrentNeighborhood(neighborhood as Neighborhood);
            setIsLoading(false);
            return;
          }
        }
      } catch (memErr) {
        console.warn("[useNeighborhoodData] Exception in membership check:", memErr);
        // Continue to fallback methods
      }
      
      console.log("[useNeighborhoodData] No neighborhoods found (attempt " + fetchAttempts + ")");
      setCurrentNeighborhood(null);
      
      // Always ensure loading is set to false when done
      setIsLoading(false);
      
      // Calculate fetch duration for performance logging  
      const duration = Date.now() - startTime;
      console.log(`[useNeighborhoodData] Fetch completed with no neighborhoods (duration: ${duration}ms)`);
      
    } catch (err) {
      // Handle unexpected errors
      console.error("[useNeighborhoodData] Error fetching neighborhood:", {
        error: err,
        errorMessage: err instanceof Error ? err.message : String(err),
        userId: user?.id,
        fetchAttempt: fetchAttempts
      });
      
      // Set error for UI to display
      setError(err instanceof Error ? err : new Error('Failed to fetch neighborhood'));
      
      // Reset current neighborhood in case of error
      setCurrentNeighborhood(null);
      
      // Always mark loading as complete
      setIsLoading(false);
      
      // Calculate fetch duration for performance logging
      const duration = Date.now() - startTime;
      console.log(`[useNeighborhoodData] Fetch failed with error (duration: ${duration}ms)`);

      // Increment retry count for backoff calculation
      setRetryCount(prev => prev + 1);
    }
  }, [
    user, 
    fetchAttempts, 
    currentNeighborhood
  ]);

  // Effect for auto-retrying with exponential backoff
  useEffect(() => {
    // Skip if no user or we're not loading
    if (!user || !error) {
      return;
    }
    
    // Only retry up to 3 times
    if (retryCount >= 3) {
      console.log("[useNeighborhoodData] Maximum retry attempts reached, stopping retries");
      toast.error("Failed to load neighborhood data after multiple attempts", {
        description: "Please try refreshing the page"
      });
      return;
    }
    
    // Implement exponential backoff: 2^retryCount * 1000ms (1s, 2s, 4s)
    const backoffTime = Math.min(2 ** retryCount * 1000, 10000); // Cap at 10 seconds
    console.log(`[useNeighborhoodData] Retrying after ${backoffTime}ms (attempt ${retryCount + 1})`);
    
    const retryTimer = setTimeout(() => {
      // Trigger another fetch attempt
      setFetchAttempts(prev => prev + 1);
    }, backoffTime);
    
    return () => {
      clearTimeout(retryTimer);
    };
  }, [user, error, retryCount]);

  // Main effect to fetch neighborhood data
  useEffect(() => {
    // Call the fetch function when the component mounts or user/fetchAttempts changes
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
    
  }, [user, fetchAttempts, fetchNeighborhood]);

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

  return { 
    currentNeighborhood, 
    isLoading, 
    error,
    isCoreContributor,
    allNeighborhoods,
    setCurrentNeighborhood,
    refreshNeighborhoodData  // Exposing the refresh function
  };
}
