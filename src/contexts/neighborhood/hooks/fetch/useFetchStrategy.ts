
/**
 * Hook that provides neighborhood fetch strategies
 * 
 * This hook centralizes different methods for fetching neighborhood data,
 * focusing on approaches that avoid RLS recursion issues.
 */
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Neighborhood } from '../../types';

/**
 * Custom hook that provides neighborhood fetch strategies
 * 
 * @returns Object with various fetch strategy functions
 */
export const useFetchStrategy = () => {
  /**
   * Fetch neighborhoods for a user using the security definer RPC function
   * 
   * This is the primary strategy that avoids RLS recursion by using a
   * database function with elevated privileges.
   * 
   * @param userId - The ID of the user to fetch neighborhoods for
   * @returns Promise resolving to an array of neighborhoods
   */
  const fetchUserNeighborhoods = useCallback(async (userId: string): Promise<Neighborhood[]> => {
    try {
      // Log the start of the neighborhood fetch process
      console.log("[useFetchStrategy] Starting neighborhood fetch for user:", userId);
      
      // Validate user ID to ensure we're not making unnecessary requests
      if (!userId) {
        console.error("[useFetchStrategy] Invalid user ID provided:", userId);
        return [];
      }
      
      // Validate supabase client is available and has rpc method
      if (!supabase) {
        console.error("[useFetchStrategy] Supabase client is undefined");
        return [];
      }
      
      if (!supabase.rpc) {
        console.error("[useFetchStrategy] Supabase client is missing rpc method");
        return [];
      }
      
      // Log before making the RPC call
      console.log("[useFetchStrategy] Calling get_user_neighborhoods RPC with user_uuid:", userId);
      
      // Call the special security definer function that bypasses RLS policies
      // This is critical for avoiding the infinite recursion issue
      const { data, error } = await supabase
        .rpc('get_user_neighborhoods', { 
          user_uuid: userId 
        });
      
      // Handle errors from the RPC call
      if (error) {
        console.error("[useFetchStrategy] Error fetching neighborhoods with RPC:", error);
        // Log extended error details to help diagnose issues
        console.error("[useFetchStrategy] Error details:", {
          message: error.message,
          hint: error.hint,
          details: error.details,
          code: error.code
        });
        
        // If we have an infinite recursion error, log it specifically
        if (error.message && error.message.includes("recursion")) {
          console.error("[useFetchStrategy] ⚠️ RECURSION DETECTED! This indicates an RLS policy issue.");
        }
        
        return []; // Return empty array instead of throwing to prevent UI errors
      }
      
      // Check if we actually got data back
      if (!data || data.length === 0) {
        console.log("[useFetchStrategy] No neighborhoods found for user:", userId);
        return [];
      }
      
      // Log success and return the data
      console.log("[useFetchStrategy] Successfully fetched neighborhoods:", {
        count: data.length,
        neighborhoodIds: data.map(n => n.id),
        firstNeighborhoodName: data[0]?.name
      });
      
      return data;
    } catch (err) {
      // Catch any uncaught errors
      console.error("[useFetchStrategy] Unexpected error in fetchUserNeighborhoods:", err);
      console.error("[useFetchStrategy] Error stack:", (err as Error).stack);
      return []; // Return empty array instead of throwing
    }
  }, []);
  
  /**
   * Alternative strategy to check if a user is a core contributor
   * with access to all neighborhoods
   * 
   * @param userId - The ID of the user to check
   * @returns Promise resolving to a boolean indicating if they have access
   */
  const checkCoreContributorAccess = useCallback(async (userId: string): Promise<boolean> => {
    try {
      // Validate inputs
      if (!userId) {
        console.error("[useFetchStrategy] Invalid user ID for core contributor check:", userId);
        return false;
      }
      
      // Check for valid supabase client
      if (!supabase || !supabase.rpc) {
        console.error("[useFetchStrategy] Invalid Supabase client in core contributor check");
        return false;
      }
      
      console.log("[useFetchStrategy] Checking if user is core contributor:", userId);
      
      const { data, error } = await supabase
        .rpc('user_is_core_contributor_with_access', {
          user_uuid: userId
        });
      
      if (error) {
        console.error("[useFetchStrategy] Error checking core contributor status:", error);
        return false;
      }
      
      console.log("[useFetchStrategy] Core contributor check result:", !!data);
      return !!data;
    } catch (err) {
      console.error("[useFetchStrategy] Error in checkCoreContributorAccess:", err);
      return false;
    }
  }, []);
  
  /**
   * Fetch all neighborhoods if the user is a core contributor
   * with access to all neighborhoods
   * 
   * @param userId - The ID of the user to fetch for
   * @returns Promise resolving to an array of neighborhoods
   */
  const fetchAllNeighborhoodsForContributor = useCallback(async (userId: string): Promise<Neighborhood[]> => {
    try {
      // Validate inputs
      if (!userId) {
        console.error("[useFetchStrategy] Invalid user ID for all neighborhoods fetch:", userId);
        return [];
      }
      
      // Check for valid supabase client
      if (!supabase || !supabase.rpc) {
        console.error("[useFetchStrategy] Invalid Supabase client in all neighborhoods fetch");
        return [];
      }
      
      console.log("[useFetchStrategy] Fetching all neighborhoods for contributor:", userId);
      
      const { data, error } = await supabase
        .rpc('get_all_neighborhoods_for_core_contributor', {
          user_uuid: userId
        });
      
      if (error) {
        console.error("[useFetchStrategy] Error fetching all neighborhoods for contributor:", error);
        return [];
      }
      
      console.log("[useFetchStrategy] Successfully fetched all neighborhoods:", {
        count: data?.length || 0
      });
      
      return data || [];
    } catch (err) {
      console.error("[useFetchStrategy] Error in fetchAllNeighborhoodsForContributor:", err);
      return [];
    }
  }, []);
  
  // Return all fetch strategies
  return {
    fetchUserNeighborhoods,
    checkCoreContributorAccess,
    fetchAllNeighborhoodsForContributor
  };
};
