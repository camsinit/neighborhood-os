
/**
 * Utility functions for core contributor operations
 * 
 * These functions handle checking core contributor status and access
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to check if a user is a core contributor with access to all neighborhoods
 * Uses a direct query pattern to avoid recursion issues
 * 
 * @param userId - The ID of the user to check
 * @returns Promise that resolves to true if the user is a core contributor with access, false otherwise
 */
export async function checkCoreContributorAccess(userId: string): Promise<boolean> {
  try {
    // Validate supabase client
    if (!supabase) {
      console.error("[NeighborhoodUtils] Supabase client is not available");
      return false;
    }

    // First try to use the user_is_core_contributor_with_access RPC function if it exists
    try {
      const { data, error } = await supabase.rpc(
        'user_is_core_contributor_with_access',
        { user_uuid: userId }
      );
      
      if (!error) {
        return !!data;
      }
    } catch (rpcErr) {
      console.warn("[NeighborhoodUtils] RPC user_is_core_contributor_with_access failed, falling back to direct query:", rpcErr);
    }
    
    // Fall back to a more direct query approach to avoid RLS recursion
    const { data, error } = await supabase
      .from('core_contributors')
      .select('can_access_all_neighborhoods')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      // If error is not found or another issue, log it but don't fail
      console.error("[NeighborhoodUtils] Error checking core contributor access:", error);
      return false;
    }
      
    return !!data?.can_access_all_neighborhoods;
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in checkCoreContributorAccess:", err);
    return false;
  }
}

/**
 * Utility function to fetch all neighborhoods for a core contributor
 * This uses the security definer function to avoid RLS recursion
 * 
 * @param userId - The ID of the core contributor
 * @returns Promise that resolves to an array of all neighborhoods if the user has access
 */
export async function fetchAllNeighborhoodsForCoreContributor(userId: string): Promise<any[]> {
  try {
    // Validate supabase client
    if (!supabase) {
      console.error("[NeighborhoodUtils] Supabase client is not available");
      return [];
    }

    // Try to use the get_all_neighborhoods_for_core_contributor RPC function
    try {
      const { data, error } = await supabase.rpc(
        'get_all_neighborhoods_for_core_contributor', 
        { user_uuid: userId }
      );
      
      if (!error && data) {
        return data as any[];
      }
    } catch (rpcErr) {
      console.warn("[NeighborhoodUtils] RPC get_all_neighborhoods_for_core_contributor failed, falling back to direct query:", rpcErr);
    }

    // Fall back to using the core contributor check and then a separate query
    const isCore = await checkCoreContributorAccess(userId);
    if (!isCore) {
      return [];
    }

    // Direct query to neighborhoods to avoid RLS issues
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name')
      .order('name');
      
    if (error) {
      console.error("[NeighborhoodUtils] Error fetching neighborhoods for core contributor:", error);
      return [];
    }
      
    return data as any[];
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchAllNeighborhoodsForCoreContributor:", err);
    return [];
  }
}
