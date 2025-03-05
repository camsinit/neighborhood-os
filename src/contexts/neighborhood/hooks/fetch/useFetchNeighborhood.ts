
/**
 * Refactored hook for fetching neighborhood data
 * 
 * This hook coordinates the neighborhood fetch process using
 * smaller, more focused hooks
 */
import { useCallback, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { useFetchState } from './useFetchState';
import { useFetchErrorHandler } from './useFetchErrorHandler';
import { 
  checkCreatedNeighborhoodStrategy,
  checkMembershipStrategy
} from './useFetchStrategy';

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
  // Get state management functions
  const { 
    error, 
    hasFetchAttempted, 
    setError, 
    setHasFetchAttempted,
    resetStates 
  } = useFetchState();
  
  // Get error handling functions
  const { handleFetchError, handleClientError } = useFetchErrorHandler();

  // The main fetch function that gets neighborhood data
  const fetchNeighborhood = useCallback(async (
    startFetchTimer: () => number,
    endFetchTimer: (startTime: number) => void,
    setIsLoading: (loading: boolean) => void,
    setAllNeighborhoods: (neighborhoods: Neighborhood[]) => void,
    setCurrentNeighborhood: (neighborhood: Neighborhood | null) => void
  ) => {
    // Track fetch attempts and start time
    const currentAttempt = fetchAttempts + 1;
    const startTime = startFetchTimer();
    
    console.log(`[useFetchNeighborhood] Fetch attempt ${currentAttempt} starting`);
    
    // Reset states at the start of each fetch
    // We need to remove the setIsCoreContributor parameter since we no longer need it
    resetStates(setIsLoading, setAllNeighborhoods);

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
      // Check if supabase client is valid
      if (!handleClientError(supabase, currentAttempt, setError, setIsLoading)) {
        return;
      }

      // Try a direct, simplified approach first - this helps us debug
      console.log("[useFetchNeighborhood] TESTING: Making direct query to diagnose the issue");
      
      try {
        // First, try a simple direct query to see if basic auth works
        const { data: authTest, error: authError } = await supabase.auth.getUser();
        console.log("[useFetchNeighborhood] Auth test result:", { 
          success: !!authTest?.user, 
          userId: authTest?.user?.id,
          error: authError ? authError.message : null
        });
        
        // Next, try direct query to neighborhoods (should work for everyone)
        const { data: nbTest, error: nbError } = await supabase
          .from('neighborhoods')
          .select('id, name')
          .limit(1);
          
        console.log("[useFetchNeighborhood] Neighborhoods query test:", { 
          success: !!nbTest, 
          count: nbTest?.length,
          error: nbError ? nbError.message : null
        });
          
        // Finally, try direct query to neighborhood_members (this is likely where the recursion happens)
        const { data: nmTest, error: nmError } = await supabase
          .from('neighborhood_members')
          .select('id, neighborhood_id, user_id')
          .eq('user_id', user.id)
          .limit(1);
          
        console.log("[useFetchNeighborhood] Neighborhood members query test:", { 
          success: !!nmTest, 
          count: nmTest?.length,
          error: nmError ? nmError.message : null,
          errorDetails: nmError
        });
      } catch (diagError) {
        console.error("[useFetchNeighborhood] Diagnostic query error:", diagError);
      }

      // Check if user created any neighborhoods
      const foundCreatedNeighborhood = await checkCreatedNeighborhoodStrategy(
        user.id,
        setCurrentNeighborhood,
        currentAttempt
      );
      
      // If we found a created neighborhood, we're done
      if (foundCreatedNeighborhood) {
        setIsLoading(false);
        endFetchTimer(startTime);
        return;
      }
      
      // Check if user is a member of any neighborhoods
      const foundMembership = await checkMembershipStrategy(
        user.id,
        setCurrentNeighborhood,
        currentAttempt
      );
      
      // If we get here, user has no neighborhood
      console.log(`[useFetchNeighborhood] Completed neighborhood check (attempt ${currentAttempt}):`, {
        hasNeighborhood: foundMembership
      });
      
      if (!foundMembership) {
        console.log(`[useFetchNeighborhood] User has no neighborhood (attempt ${currentAttempt})`);
        setCurrentNeighborhood(null);
      }
      
      // Always ensure loading is set to false when done
      setIsLoading(false);
      
      // Calculate fetch duration for performance logging  
      endFetchTimer(startTime);
      
    } catch (err) {
      // Handle unexpected errors
      console.error("[useFetchNeighborhood] Top-level error:", err);
      handleFetchError(
        err, 
        user?.id, 
        currentAttempt, 
        setError, 
        setCurrentNeighborhood,
        setIsLoading
      );
      
      // Calculate fetch duration for performance logging
      endFetchTimer(startTime);
    }
  }, [
    currentNeighborhood, 
    fetchAttempts, 
    user, 
    resetStates, 
    handleClientError, 
    handleFetchError
  ]);

  return {
    fetchNeighborhood,
    error,
    hasFetchAttempted,
    setError
  };
}

// Re-export the core fetch hook for backward compatibility
export default useFetchNeighborhood;
