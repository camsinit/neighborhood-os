
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
export async function fetchCreatedNeighborhoods(userId: string): Promise<Neighborhood[]> {
  try {
    // Validate supabase client
    if (!supabase) {
      console.error("[NeighborhoodUtils] Supabase client is not available");
      return [];
    }

    // This query is safe because we're filtering by created_by which is not subject to RLS recursion
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name, created_by')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(1);
          
    if (error) {
      console.error("[NeighborhoodUtils] Error checking created neighborhoods:", error);
      // Don't throw, just return empty array
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchCreatedNeighborhoods:", err);
    return [];
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

    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name, created_by');
    
    if (error) {
      console.error("[NeighborhoodUtils] Error fetching all neighborhoods:", error);
      return [];
    }
    
    return data || [];
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
    if (!supabase || !supabase.rpc) {
      console.error("[NeighborhoodUtils] Supabase client or RPC method is not available");
      return false;
    }

    // Instead of directly querying neighborhood_members table which causes recursion
    // Use the security definer function we created
    const { data: isMember, error } = await supabase
      .rpc('user_is_neighborhood_member', {
        user_uuid: userId,
        neighborhood_uuid: neighborhoodId
      }) as { data: boolean | null, error: any };
            
    if (error) {
      console.error(`[NeighborhoodUtils] Error checking membership for ${neighborhoodId}:`, error);
      return false;
    }
            
    return !!isMember;
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
    if (!supabase || !supabase.rpc) {
      console.error("[NeighborhoodUtils] Supabase client or RPC method is not available");
      return false;
    }

    // Use our security definer function to check if the user is a core contributor with access
    const { data: hasAccess, error } = await supabase
      .rpc('user_is_core_contributor_with_access', {
        user_uuid: userId
      }) as { data: boolean | null, error: any };
      
    if (error) {
      console.error("[NeighborhoodUtils] Error checking core contributor access:", error);
      return false;
    }
      
    return !!hasAccess;
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
    if (!supabase || !supabase.rpc) {
      console.error("[NeighborhoodUtils] Supabase client or RPC method is not available");
      return [];
    }

    // Use our security definer function to get all neighborhoods for a core contributor
    const { data, error } = await supabase
      .rpc('get_all_neighborhoods_for_core_contributor', {
        user_uuid: userId
      }) as { data: Neighborhood[] | null, error: any };
      
    if (error) {
      console.error("[NeighborhoodUtils] Error fetching neighborhoods for core contributor:", error);
      return [];
    }
      
    return data || [];
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchAllNeighborhoodsForCoreContributor:", err);
    return [];
  }
}
