
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
      console.log("[useFetchStrategy] Fetching neighborhoods for user:", userId);
      
      // Call the get_user_neighborhoods RPC function
      const { data, error } = await supabase
        .rpc('get_user_neighborhoods', { 
          user_uuid: userId 
        });
      
      // Handle errors
      if (error) {
        console.error("[useFetchStrategy] Error fetching neighborhoods with RPC:", error);
        throw new Error(`Failed to fetch neighborhoods: ${error.message}`);
      }
      
      // Log success
      console.log("[useFetchStrategy] Successfully fetched neighborhoods:", {
        count: data?.length || 0
      });
      
      return data || [];
    } catch (err) {
      console.error("[useFetchStrategy] Error in fetchUserNeighborhoods:", err);
      throw err;
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
