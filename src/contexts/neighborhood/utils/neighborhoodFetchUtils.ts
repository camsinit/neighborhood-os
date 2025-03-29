
/**
 * Utility functions for fetching neighborhood data
 * 
 * These functions handle retrieving neighborhood information using
 * security definer functions to avoid RLS recursion
 */

import { supabase } from '@/integrations/supabase/client';
import { Neighborhood } from '../types';

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

    // Instead of RPC function that may not exist, use a direct query
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

    // Try to use the get_all_neighborhoods_safe RPC function if it exists
    if (typeof supabase.rpc === 'function') {
      try {
        const { data, error } = await supabase.rpc('get_all_neighborhoods_safe');
        
        if (!error && data) {
          return data as Neighborhood[];
        }
        // If RPC fails, fall back to direct query
      } catch (rpcErr) {
        console.warn("[NeighborhoodUtils] RPC function not available, falling back to direct query:", rpcErr);
      }
    }

    // Fall back to direct query
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
 * Utility function to get a user's neighborhood memberships
 * Uses the security definer function to avoid RLS recursion
 * 
 * @param userId - The ID of the user to check
 * @returns Promise that resolves to an array of neighborhoods the user is a member of
 */
export async function fetchUserNeighborhoods(userId: string): Promise<Neighborhood[]> {
  try {
    // Validate supabase client
    if (!supabase) {
      console.error("[NeighborhoodUtils] Supabase client is not available");
      return [];
    }

    // First try to get neighborhoods created by the user
    const { data: createdNeighborhoods, error: createdError } = await fetchCreatedNeighborhoods(userId);
    if (createdNeighborhoods && createdNeighborhoods.length > 0) {
      return createdNeighborhoods;
    }
    
    // If no created neighborhoods, try to get neighborhoods via the get_user_neighborhoods RPC function
    if (typeof supabase.rpc === 'function') {
      try {
        const { data, error } = await supabase.rpc(
          'get_user_neighborhoods',
          { user_uuid: userId }
        );
        
        if (error) {
          console.error("[NeighborhoodUtils] Error fetching user neighborhoods via RPC:", error);
        } else if (data) {
          return data as Neighborhood[];
        }
      } catch (rpcErr) {
        console.warn("[NeighborhoodUtils] RPC function not available:", rpcErr);
      }
    }
    
    // As a last resort, try direct query to neighborhood_members
    console.log("[NeighborhoodUtils] Falling back to direct query for user neighborhoods");
    
    // Use the get_user_neighborhood_memberships function which is safer
    const { data: memberships, error: membershipError } = await supabase
      .rpc('get_user_neighborhood_memberships', { 
        user_uuid: userId 
      });
      
    if (membershipError) {
      console.error("[NeighborhoodUtils] Error fetching user memberships:", membershipError);
      return [];
    }
    
    if (!memberships || !Array.isArray(memberships) || memberships.length === 0) {
      return [];
    }
    
    // Get the neighborhood details for each membership
    const neighborhoodIds = memberships.map(m => m.neighborhood_id);
    
    const { data: neighborhoods, error: neighborhoodsError } = await supabase
      .from('neighborhoods')
      .select('id, name')
      .in('id', neighborhoodIds);
      
    if (neighborhoodsError) {
      console.error("[NeighborhoodUtils] Error fetching neighborhood details:", neighborhoodsError);
      return [];
    }
    
    return neighborhoods as Neighborhood[];
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchUserNeighborhoods:", err);
    return [];
  }
}

/**
 * Fetch neighborhood members using the security definer function to avoid RLS recursion
 * 
 * @param neighborhoodId - The ID of the neighborhood to get members for
 * @returns Promise that resolves to an array of user IDs
 */
export async function fetchNeighborhoodMembers(neighborhoodId: string): Promise<string[]> {
  try {
    // Validate supabase client
    if (!supabase) {
      console.error("[NeighborhoodUtils] Supabase client is not available");
      return [];
    }
    
    // Use the get_neighborhood_members_by_neighborhood function to safely get members
    const { data, error } = await supabase
      .rpc('get_neighborhood_members_by_neighborhood', {
        neighborhood_uuid: neighborhoodId
      });
    
    if (error) {
      console.error("[NeighborhoodUtils] Error fetching neighborhood members:", error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchNeighborhoodMembers:", err);
    return [];
  }
}
