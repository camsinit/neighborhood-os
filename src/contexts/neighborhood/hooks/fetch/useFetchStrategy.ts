
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
      // Log that we're trying to fetch neighborhoods
      console.log("[useFetchStrategy] Fetching neighborhoods for user:", userId);
      
      // Check for valid supabase client
      if (!supabase || !supabase.rpc) {
        console.error("[useFetchStrategy] Invalid Supabase client - missing rpc method");
        return [];
      }
      
      // Call the get_user_neighborhoods RPC function
      // This is a security definer function that avoids RLS recursion issues
      const { data, error } = await supabase
        .rpc('get_user_neighborhoods', { 
          user_uuid: userId 
        });
      
      // Log the result of the RPC call
      if (error) {
        console.error("[useFetchStrategy] Error fetching neighborhoods with RPC:", error);
        // Log extended error details to help diagnose issues
        console.error("[useFetchStrategy] Error details:", {
          message: error.message,
          hint: error.hint,
          details: error.details,
          code: error.code
        });
        return []; // Return empty array instead of throwing to prevent UI errors
      }
      
      // Log success and return the data
      console.log("[useFetchStrategy] Successfully fetched neighborhoods:", {
        count: data?.length || 0,
        neighborhoods: data
      });
      
      return data || [];
    } catch (err) {
      // Catch any uncaught errors
      console.error("[useFetchStrategy] Unexpected error in fetchUserNeighborhoods:", err);
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
      // Check for valid supabase client
      if (!supabase || !supabase.rpc) {
        console.error("[useFetchStrategy] Invalid Supabase client - missing rpc method");
        return false;
      }
      
      const { data, error } = await supabase
        .rpc('user_is_core_contributor_with_access', {
          user_uuid: userId
        });
      
      if (error) {
        console.error("[useFetchStrategy] Error checking core contributor status:", error);
        return false;
      }
      
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
      // Check for valid supabase client
      if (!supabase || !supabase.rpc) {
        console.error("[useFetchStrategy] Invalid Supabase client - missing rpc method");
        return [];
      }
      
      const { data, error } = await supabase
        .rpc('get_all_neighborhoods_for_core_contributor', {
          user_uuid: userId
        });
      
      if (error) {
        console.error("[useFetchStrategy] Error fetching all neighborhoods for contributor:", error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error("[useFetchStrategy] Error in fetchAllNeighborhoodsForContributor:", err);
      return [];
    }
  }, []);
  
  return {
    fetchUserNeighborhoods,
    checkCoreContributorAccess,
    fetchAllNeighborhoodsForContributor
  };
};
