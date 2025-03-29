
/**
 * Utility functions for core contributor operations
 * 
 * These functions handle checking core contributor status and access
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to check if a user is a core contributor with access to all neighborhoods
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

    // Use a direct query with explicit typing
    const { data, error } = await supabase
      .from('core_contributors')
      .select('can_access_all_neighborhoods')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      // If error is not found, it means the user is not a core contributor
      if (error.code === 'PGRST116') {
        return false;
      }
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
 * This is only accessible to users with core contributor access
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

    // First check if the user is a core contributor with access
    const isCore = await checkCoreContributorAccess(userId);
    if (!isCore) {
      return [];
    }

    // Since they have access, just return all neighborhoods
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
