
/**
 * Utility functions for neighborhood data
 * 
 * These functions handle API calls to Supabase for neighborhood-related operations
 * and are designed to avoid RLS recursion issues
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

    // Use a direct query approach to avoid RLS recursion
    // This query directly checks the created_by field which has simpler RLS
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name, created_by, created_at, geo_boundary, address, city, state, zip')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
          
    if (error) {
      console.error("[NeighborhoodUtils] Error checking created neighborhoods:", error);
      return { data: null, error };
    }
    
    console.log("[NeighborhoodUtils] Successfully fetched created neighborhoods:", {
      count: data?.length || 0,
      userId
    });
    
    return { data, error: null };
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchCreatedNeighborhoods:", err);
    return { data: null, error: err };
  }
}

/**
 * Utility function to fetch all neighborhoods in the system
 * Uses a safer approach to avoid RLS recursion
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

    // Use a simple direct query that doesn't involve complex relationships
    // This avoids the RLS recursion issues
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name, created_by, created_at, geo_boundary, address, city, state, zip')
      .order('name');
    
    if (error) {
      console.error("[NeighborhoodUtils] Error fetching all neighborhoods:", error);
      return [];
    }
    
    console.log("[NeighborhoodUtils] Successfully fetched all neighborhoods:", {
      count: data?.length || 0
    });
    
    return data || [];
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchAllNeighborhoods:", err);
    return [];
  }
}

/**
 * Utility function to check if a user is a member of a specific neighborhood
 * Uses a fallback approach to avoid RLS recursion
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

    // Use simple direct query on the neighborhood_members table
    // This avoids complex joins that might trigger recursion
    const { data, error } = await supabase
      .from('neighborhood_members')
      .select('id')
      .eq('user_id', userId)
      .eq('neighborhood_id', neighborhoodId)
      .eq('status', 'active')
      .maybeSingle();
            
    if (error) {
      // If we get a recursion error, try the fallback approach
      if (error.message?.includes('recursion')) {
        console.log("[NeighborhoodUtils] Recursion detected, using fallback method for membership check");
        return await checkIsMemberFallback(userId, neighborhoodId);
      }
      
      console.error("[NeighborhoodUtils] Error checking membership:", error);
      return false;
    }
            
    return !!data;
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in checkNeighborhoodMembership:", err);
    return false;
  }
}

/**
 * Fallback method to check membership that avoids complex queries
 * This is used when the primary method encounters recursion errors
 */
async function checkIsMemberFallback(userId: string, neighborhoodId: string): Promise<boolean> {
  try {
    // Use the simpler debug_neighborhood_members view which may have different RLS settings
    const { data, error } = await supabase
      .from('debug_neighborhood_members')
      .select('id')
      .eq('user_id', userId)
      .eq('neighborhood_id', neighborhoodId)
      .eq('status', 'active')
      .maybeSingle();
      
    if (error) {
      console.error("[NeighborhoodUtils] Fallback method error:", error);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fallback method:", err);
    return false;
  }
}

/**
 * Utility function to check if a user is a core contributor with access to all neighborhoods
 * Uses a direct query approach to avoid RLS issues
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

    // Use a direct query on the core_contributors table
    const { data, error } = await supabase
      .from('core_contributors')
      .select('id, can_access_all_neighborhoods')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
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
 * This provides a direct data fetching approach for authorized users
 * 
 * @param userId - The ID of the core contributor
 * @returns Promise that resolves to an array of all neighborhoods if the user has access
 */
export async function fetchAllNeighborhoodsForCoreContributor(userId: string): Promise<Neighborhood[]> {
  try {
    // First check if user has core contributor access
    const hasAccess = await checkCoreContributorAccess(userId);
    
    if (!hasAccess) {
      console.log("[NeighborhoodUtils] User is not a core contributor with access");
      return [];
    }
    
    // If they have access, fetch all neighborhoods
    return await fetchAllNeighborhoods();
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchAllNeighborhoodsForCoreContributor:", err);
    return [];
  }
}
