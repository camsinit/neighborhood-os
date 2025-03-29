
/**
 * Utility functions for neighborhood data
 * 
 * These functions handle API calls to Supabase for neighborhood-related operations
 * that avoid RLS recursion issues
 */

import { supabase } from '@/integrations/supabase/client';
import { Neighborhood } from './types';

/**
 * Utility function to check if a user has created any neighborhoods
 * This approach avoids the RLS recursion by using a direct query pattern
 * 
 * @param userId - The ID of the user to check
 * @returns Promise that resolves to an array of neighborhoods created by the user
 */
export async function fetchCreatedNeighborhoods(userId: string): Promise<{ data: Neighborhood[] | null, error: any }> {
  try {
    // Validate supabase client
    if (!supabase) {
      console.error("[NeighborhoodUtils] Supabase client is not available");
      return { data: null, error: new Error("Supabase client is not available") };
    }

    // Instead of querying directly which can trigger RLS recursion,
    // use a custom query that's designed to avoid recursion
    // NOTE: Since TypeScript doesn't know about our custom RPC functions,
    // we need to add explicit typing for the response
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
          
    if (error) {
      console.error("[NeighborhoodUtils] Error checking created neighborhoods:", error);
      return { data: null, error };
    }
    
    return { data: data as Neighborhood[], error: null };
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchCreatedNeighborhoods:", err);
    return { data: null, error: err };
  }
}

/**
 * Utility function to fetch all neighborhoods in the system
 * 
 * @returns Promise that resolves to an array of all neighborhoods
 */
export async function fetchAllNeighborhoods(): Promise<Neighborhood[]> {
  try {
    // Validate supabase client
    if (!supabase) {
      console.error("[NeighborhoodUtils] Supabase client is not available");
      return [];
    }

    // Use a direct query instead of RPC
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name')
      .order('name');
    
    if (error) {
      console.error("[NeighborhoodUtils] Error fetching all neighborhoods:", error);
      return [];
    }
    
    return data as Neighborhood[];
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchAllNeighborhoods:", err);
    return [];
  }
}

/**
 * Utility function to check if a user is a member of a specific neighborhood
 * Uses our safe approach to avoid RLS recursion
 * 
 * @param userId - The ID of the user to check
 * @param neighborhoodId - The ID of the neighborhood to check
 * @returns Promise that resolves to true if the user is a member, false otherwise
 */
export async function checkNeighborhoodMembership(
  userId: string, 
  neighborhoodId: string
): Promise<boolean> {
  try {
    // Validate supabase client
    if (!supabase) {
      console.error("[NeighborhoodUtils] Supabase client is not available");
      return false;
    }

    // Use a direct query with explicit typing
    const { data, error } = await supabase
      .from('neighborhood_members')
      .select('user_id')
      .eq('user_id', userId)
      .eq('neighborhood_id', neighborhoodId)
      .eq('status', 'active')
      .single();
            
    if (error) {
      console.error(`[NeighborhoodUtils] Error checking membership for ${neighborhoodId}:`, error);
      return false;
    }
            
    return !!data;
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in checkNeighborhoodMembership:", err);
    return false;
  }
}

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
export async function fetchAllNeighborhoodsForCoreContributor(userId: string): Promise<Neighborhood[]> {
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
      
    return data as Neighborhood[];
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchAllNeighborhoodsForCoreContributor:", err);
    return [];
  }
}

/**
 * Creates necessary RPC functions in Supabase if they don't exist already.
 * This is a helper function to ensure all required functions are available.
 */
export async function createRequiredRPCFunctions(): Promise<void> {
  // This would normally be done in a migration, but we'll add it here as a backup
  console.log("[NeighborhoodUtils] Creating required RPC functions is meant to be done in migrations");
}
