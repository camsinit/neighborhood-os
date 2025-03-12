/**
 * Hook to handle neighborhood data fetching
 * 
 * This module centralizes the logic for fetching neighborhood data using
 * security definer functions to avoid RLS recursion issues.
 */
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { useFetchState } from './useFetchState';
import { useFetchStrategy } from './useFetchStrategy'; 
import { useFetchErrorHandler } from './useFetchErrorHandler';
import { Neighborhood } from '../../types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Custom hook for fetching neighborhood data
 * 
 * This hook uses RPC functions to safely fetch neighborhood data without triggering
 * RLS recursion errors.
 * 
 * @param user - The current authenticated user
 * @param currentNeighborhood - The current neighborhood
 * @param currentAttempt - The current fetch attempt count
 * @returns Fetch function and state
 */
export const useFetchNeighborhood = (
  user: User | null,
  currentNeighborhood: Neighborhood | null,
  currentAttempt: number
) => {
  // State for error handling
  const [error, setError] = useState<Error | null>(null);
  
  // Import strategies from helper hooks
  const { fetchUserNeighborhoods } = useFetchStrategy();
  const { handleFetchError } = useFetchErrorHandler();
  
  // Import state handling functions
  const { 
    resetStates, 
    hasFetchAttempted, 
    setHasFetchAttempted 
  } = useFetchState();
  
  /**
   * The main fetch function that orchestrates the neighborhood data fetching
   * 
   * This implementation uses the get_user_neighborhoods RPC function to safely
   * fetch neighborhood data without triggering RLS recursion.
   * 
   * @param startFetchTimer - Function to start safety timeout 
   * @param endFetchTimer - Function to end safety timeout
   * @param setIsLoading - Function to update loading state
   * @param setAllNeighborhoods - Function to update all neighborhoods state
   * @param setCurrentNeighborhood - Function to update current neighborhood state
   * @param setHasFetchAttempted - Function to update fetch attempt state
   */
  const fetchNeighborhood = useCallback(async (
    startFetchTimer: () => void,
    endFetchTimer: () => void,
    setIsLoading: (loading: boolean) => void,
    setAllNeighborhoods: (neighborhoods: Neighborhood[]) => void,
    setCurrentNeighborhood: (neighborhood: Neighborhood | null) => void,
    setHasFetchAttempted: (hasAttempted: boolean) => void
  ) => {
    // Start timer for safety timeout
    startFetchTimer();
    
    // Log fetch attempt
    console.log(`[useFetchNeighborhood] Fetch attempt ${currentAttempt} starting`);
    
    // Reset states at the start of each fetch
    resetStates(setIsLoading, setAllNeighborhoods);

    // If no user is logged in, we can't fetch neighborhood data
    if (!user) {
      console.log("[useFetchNeighborhood] No user logged in, clearing neighborhood data");
      setCurrentNeighborhood(null);
      setIsLoading(false);
      endFetchTimer();
      setHasFetchAttempted(true);
      return;
    }
    
    try {
      // Validate supabase client (safety check)
      if (!supabase || !supabase.rpc) {
        const clientError = new Error("Supabase client is not properly initialized");
        console.error("[useFetchNeighborhood] Supabase client error:", clientError);
        setError(clientError);
        setIsLoading(false);
        endFetchTimer();
        setHasFetchAttempted(true);
        return;
      }
      
      // Use the security definer RPC function to avoid RLS recursion
      console.log("[useFetchNeighborhood] Calling get_user_neighborhoods RPC function");
      const { data: neighborhoods, error: rpcError } = await supabase
        .rpc('get_user_neighborhoods', { user_uuid: user.id });
        
      // Handle RPC error
      if (rpcError) {
        console.error("[useFetchNeighborhood] RPC error fetching neighborhoods:", rpcError);
        setError(new Error(`Failed to fetch neighborhoods: ${rpcError.message}`));
        setIsLoading(false);
        endFetchTimer();
        setHasFetchAttempted(true);
        return;
      }
      
      // Check if we got neighborhoods back
      if (!neighborhoods || neighborhoods.length === 0) {
        console.log("[useFetchNeighborhood] No neighborhoods found for user");
        setCurrentNeighborhood(null);
        setAllNeighborhoods([]);
        setIsLoading(false);
        endFetchTimer();
        setHasFetchAttempted(true);
        return;
      }
      
      console.log("[useFetchNeighborhood] Neighborhoods found:", neighborhoods.length);
      
      // Update the available neighborhoods list
      setAllNeighborhoods(neighborhoods);
      
      // If we already have a current neighborhood, try to find it in the new list
      if (currentNeighborhood) {
        const stillExists = neighborhoods.find(n => n.id === currentNeighborhood.id);
        // If the current neighborhood still exists, keep it
        if (stillExists) {
          console.log("[useFetchNeighborhood] Current neighborhood still valid");
          setCurrentNeighborhood(stillExists);
        } else {
          // Otherwise, use the first neighborhood in the list
          console.log("[useFetchNeighborhood] Current neighborhood no longer valid, using first available");
          setCurrentNeighborhood(neighborhoods[0]);
        }
      } 
      // If no current neighborhood, use the first one in the list
      else {
        console.log("[useFetchNeighborhood] Setting first neighborhood as current");
        setCurrentNeighborhood(neighborhoods[0]);
      }
    } catch (err: any) {
      // Handle fetch errors with appropriate parameters
      console.error("[useFetchNeighborhood] Error fetching neighborhoods:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch neighborhood'));
      setCurrentNeighborhood(null);
    } finally {
      // End the timer and mark loading as complete
      endFetchTimer();
      setIsLoading(false);
      setHasFetchAttempted(true);
    }
  }, [
    user, 
    currentNeighborhood, 
    currentAttempt, 
    fetchUserNeighborhoods, 
    resetStates, 
    hasFetchAttempted, 
    setHasFetchAttempted
  ]);
  
  return {
    fetchNeighborhood,
    error,
    setError
  };
};
